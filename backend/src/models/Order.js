const pool = require('../config/database');

class Order {
    // Create a new order
    static async create(orderData) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const {
                order_number,
                customer_name,
                customer_phone,
                customer_email,
                customer_type,
                delivery_address,
                delivery_date,
                total_amount,
                payment_method,
                notes,
                items // Array of { product_id, quantity, unit_price }
            } = orderData;

            // Insert order
            const orderQuery = `
        INSERT INTO orders (
          order_number, customer_name, customer_phone, customer_email,
          customer_type, delivery_address, delivery_date, total_amount,
          payment_method, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

            const orderValues = [
                order_number,
                customer_name,
                customer_phone,
                customer_email,
                customer_type,
                delivery_address,
                delivery_date,
                total_amount,
                payment_method,
                notes
            ];

            const orderResult = await client.query(orderQuery, orderValues);
            const order = orderResult.rows[0];

            // Insert order items and update product quantities
            for (const item of items) {
                const { product_id, quantity, unit_price } = item;
                const total_price = quantity * unit_price;

                // Calculate 50/50 split (assuming no input costs for simplicity)
                const farmer_share = total_price * 0.5;
                const sanza_share = total_price * 0.5;

                const itemQuery = `
          INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, total_price,
            farmer_share, sanza_share
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

                await client.query(itemQuery, [
                    order.id,
                    product_id,
                    quantity,
                    unit_price,
                    total_price,
                    farmer_share,
                    sanza_share
                ]);

                // Decrease product quantity
                const updateProductQuery = `
          UPDATE products 
          SET available_quantity = available_quantity - $1,
              status = CASE 
                WHEN available_quantity - $1 <= 0 THEN 'sold_out'
                ELSE status
              END
          WHERE id = $2
        `;

                await client.query(updateProductQuery, [quantity, product_id]);
            }

            await client.query('COMMIT');
            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get all orders with optional filters
    static async findAll(filters = {}) {
        let query = `
      SELECT o.*, 
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

        const values = [];
        let paramIndex = 1;

        if (filters.order_status) {
            query += ` AND o.order_status = $${paramIndex}`;
            values.push(filters.order_status);
            paramIndex++;
        }

        if (filters.payment_status) {
            query += ` AND o.payment_status = $${paramIndex}`;
            values.push(filters.payment_status);
            paramIndex++;
        }

        if (filters.customer_type) {
            query += ` AND o.customer_type = $${paramIndex}`;
            values.push(filters.customer_type);
            paramIndex++;
        }

        if (filters.date_from) {
            query += ` AND o.created_at >= $${paramIndex}`;
            values.push(filters.date_from);
            paramIndex++;
        }

        if (filters.date_to) {
            query += ` AND o.created_at <= $${paramIndex}`;
            values.push(filters.date_to);
            paramIndex++;
        }

        query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    // Get single order with items
    static async findById(id) {
        const orderQuery = `
      SELECT * FROM orders WHERE id = $1
    `;

        const orderResult = await pool.query(orderQuery, [id]);
        if (orderResult.rows.length === 0) return null;

        const order = orderResult.rows[0];

        // Get order items
        const itemsQuery = `
      SELECT oi.*, p.product_type, p.box_size, c.name as cohort_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN cohorts c ON p.cohort_id = c.id
      WHERE oi.order_id = $1
    `;

        const itemsResult = await pool.query(itemsQuery, [id]);
        order.items = itemsResult.rows;

        return order;
    }

    // Update order status
    static async updateStatus(id, status) {
        const query = `
      UPDATE orders 
      SET order_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    // Update payment status
    static async updatePaymentStatus(id, status) {
        const query = `
      UPDATE orders 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }

    // Generate next order number (AAY-2026-XXX)
    static async generateOrderNumber() {
        const year = new Date().getFullYear();
        const query = `
      SELECT order_number 
      FROM orders 
      WHERE order_number LIKE 'AAY-${year}-%'
      ORDER BY order_number DESC 
      LIMIT 1
    `;

        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return `AAY-${year}-001`;
        }

        const lastNumber = parseInt(result.rows[0].order_number.split('-')[2]);
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        return `AAY-${year}-${nextNumber}`;
    }
}

module.exports = Order;
