import 'package:flutter/material.dart';

class MyProduceScreen extends StatefulWidget {
  const MyProduceScreen({super.key});

  @override
  State<MyProduceScreen> createState() => _MyProduceScreenState();
}

class _MyProduceScreenState extends State<MyProduceScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _produce = [];

  @override
  void initState() {
    super.initState();
    _fetchProduce();
  }

  Future<void> _fetchProduce() async {
    try {
      // Implement actual database query
      // final data = await dbService.getStoredProduce(farmerId);
      debugPrint('Fetching produce...');

      // Mock data for now
      setState(() {
        _produce = [
          {
            'id': 1,
            'crop': 'Avocado',
            'quantity': 150.0,
            'quality': 'A',
            'storedDate': DateTime.now().subtract(const Duration(days: 7)),
            'warehouse': 'Cold Room A',
            'estimatedFee': 6000.0
          }
        ];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading produce: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Stored Produce'),
        backgroundColor: Colors.green[700],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchProduce,
              child: _produce.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.inventory_2_outlined,
                              size: 80, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'No produce in storage',
                            style: TextStyle(
                                fontSize: 18, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _produce.length,
                      itemBuilder: (context, index) {
                        final item = _produce[index];
                        final daysDuration = DateTime.now()
                            .difference(item['storedDate'])
                            .inDays;

                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: Colors.green[100],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Icon(
                                        Icons.agriculture,
                                        color: Colors.green[700],
                                        size: 32,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['crop'],
                                            style: const TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${item['quantity']} kg',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: Colors.grey[700],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: item['quality'] == 'A'
                                            ? Colors.green[50]
                                            : Colors.yellow[50],
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Grade ${item['quality']}',
                                        style: TextStyle(
                                          color: item['quality'] == 'A'
                                              ? Colors.green[700]
                                              : Colors.yellow[700],
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(height: 24),
                                Row(
                                  children: [
                                    Expanded(
                                      child: _buildInfoRow(
                                        Icons.warehouse,
                                        'Warehouse',
                                        item['warehouse'],
                                      ),
                                    ),
                                    Expanded(
                                      child: _buildInfoRow(
                                        Icons.calendar_today,
                                        'Duration',
                                        '$daysDuration days',
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.orange[50],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Estimated Storage Fee:',
                                        style: TextStyle(
                                            fontWeight: FontWeight.w500),
                                      ),
                                      Text(
                                        '${item['estimatedFee'].toStringAsFixed(0)} RWF',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.orange,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => Scaffold(
                appBar: AppBar(title: const Text('Add Produce')),
                body: const Center(child: Text('Form coming soon')),
              ),
            ),
          );
        },
        backgroundColor: Colors.green[700],
        label: const Text('Log New Produce'),
        icon: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
