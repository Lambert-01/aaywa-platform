const pool = require('../config/database');

class Product {
    // Create a new product listing
    static async create(productData) {
        const {
            product_type,
            box_size,
            cohort_id,
            harvest_date,
            available_quantity,
            price_per_kg,
            description,
            certifications,
            image_url
        } = productData;

        // Calculate total price per box
        const total_price = box_size * price_per_kg;

        const query = `
      INSERT INTO products (
        product_type, box_size, cohort_id, harvest_date, 
        available_quantity, price_per_kg, total_price, 
        description, certifications, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

        const values = [
            product_type,
            box_size,
            cohort_id,
            harvest_date,
            available_quantity,
            price_per_kg,
            total_price,
            description,
            certifications ? JSON.stringify(certifications) : null,
            image_url
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Get all products with optional filters
    static async findAll(filters = {}) {
        let query = `
      SELECT p.*, c.name as cohort_name
      FROM products p
      LEFT JOIN cohorts c ON p.cohort_id = c.id
      WHERE p.status != 'deleted'
    `;

        const values = [];
        let paramIndex = 1;

        if (filters.status) {
            query += ` AND p.status = $${paramIndex}`;
            values.push(filters.status);
            paramIndex++;
        }

        if (filters.cohort_id) {
            query += ` AND p.cohort_id = $${paramIndex}`;
            values.push(filters.cohort_id);
            paramIndex++;
        }

        if (filters.product_type) {
            query += ` AND p.product_type = $${paramIndex}`;
            values.push(filters.product_type);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    // Get single product by ID
    static async findById(id) {
        const query = `
      SELECT p.*, c.name as cohort_name
      FROM products p
      LEFT JOIN cohorts c ON p.cohort_id = c.id
      WHERE p.id = $1
    `;

        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Update product
    static async update(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                // Recalculate total_price if box_size or price_per_kg changes
                if (key === 'box_size' || key === 'price_per_kg') {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(updateData[key]);
                    paramIndex++;
                } else if (key === 'certifications' && updateData[key]) {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(JSON.stringify(updateData[key]));
                    paramIndex++;
                } else {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(updateData[key]);
                    paramIndex++;
                }
            }
        });

        if (fields.length === 0) return null;

        // If box_size or price_per_kg was updated, recalculate total_price
        if (updateData.box_size || updateData.price_per_kg) {
            fields.push(`total_price = box_size * price_per_kg`);
        }

        const query = `
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        values.push(id);

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Update product status (toggle active/inactive)
    static async updateStatus(id, status) {
        const query = `
      UPDATE products 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    // Decrease product quantity (when order is placed)
    static async decreaseQuantity(id, quantity) {
        const query = `
      UPDATE products 
      SET available_quantity = available_quantity - $1,
          status = CASE 
            WHEN available_quantity - $1 <= 0 THEN 'sold_out'
            ELSE status
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND available_quantity >= $1
      RETURNING *
    `;

        const result = await pool.query(query, [quantity, id]);
        return result.rows[0];
    }

    // Delete product (Soft Delete)
    static async delete(id) {
        const query = `
            UPDATE products 
            SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = Product;
