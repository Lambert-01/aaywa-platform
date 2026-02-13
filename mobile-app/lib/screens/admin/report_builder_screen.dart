import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../theme/design_system.dart';
import '../../widgets/common/aaywa_card.dart';
import '../../providers/admin_provider.dart';

class ReportBuilderScreen extends StatefulWidget {
  const ReportBuilderScreen({super.key});

  @override
  State<ReportBuilderScreen> createState() => _ReportBuilderScreenState();
}

class _ReportBuilderScreenState extends State<ReportBuilderScreen> {
  String _selectedReportType = 'cohort_performance';
  DateTimeRange? _dateRange;
  bool _isGenerating = false;

  final List<Map<String, String>> _reportTypes = [
    {
      'id': 'cohort_performance',
      'name': 'Cohort Performance Report',
      'icon': 'groups'
    },
    {
      'id': 'crop_analysis',
      'name': 'Crop Analysis Report',
      'icon': 'agriculture'
    },
    {
      'id': 'financial_summary',
      'name': 'Financial Summary',
      'icon': 'attach_money'
    },
    {
      'id': 'staff_performance',
      'name': 'Staff Performance Report',
      'icon': 'badge'
    },
    {
      'id': 'system_health',
      'name': 'System Health Report',
      'icon': 'health_and_safety'
    },
  ];

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'groups':
        return Icons.groups;
      case 'agriculture':
        return Icons.agriculture;
      case 'attach_money':
        return Icons.attach_money;
      case 'badge':
        return Icons.badge;
      case 'health_and_safety':
        return Icons.health_and_safety;
      default:
        return Icons.description;
    }
  }

  Future<void> _selectDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _dateRange,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppColors.primaryGreen,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _dateRange = picked);
    }
  }

  Future<void> _generatePDFReport() async {
    setState(() => _isGenerating = true);

    try {
      final provider = context.read<AdminProvider>();

      // Load data based on report type
      if (_selectedReportType == 'cohort_performance') {
        await provider.loadCohortAnalytics();
      } else if (_selectedReportType == 'crop_analysis') {
        await provider.loadCropAnalytics();
      } else if (_selectedReportType == 'system_health') {
        await provider.loadSystemHealth();
      }

      // Create PDF
      final pdf = pw.Document();

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          build: (context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'AAYWA Platform Report',
                  style: pw.TextStyle(
                      fontSize: 24, fontWeight: pw.FontWeight.bold),
                ),
                pw.SizedBox(height: 10),
                pw.Text(
                  _reportTypes.firstWhere(
                      (r) => r['id'] == _selectedReportType)['name']!,
                  style: const pw.TextStyle(fontSize: 18),
                ),
                pw.SizedBox(height: 5),
                pw.Text(
                  'Generated: ${DateTime.now().toString().substring(0, 16)}',
                  style: const pw.TextStyle(
                      fontSize: 12, color: PdfColors.grey700),
                ),
                if (_dateRange != null) ...[
                  pw.Text(
                    'Period: ${_dateRange!.start.toString().substring(0, 10)} to ${_dateRange!.end.toString().substring(0, 10)}',
                    style: const pw.TextStyle(
                        fontSize: 12, color: PdfColors.grey700),
                  ),
                ],
                pw.Divider(),
                pw.SizedBox(height: 20),

                // Content based on report type
                if (_selectedReportType == 'cohort_performance')
                  _buildCohortPDFContent(provider)
                else if (_selectedReportType == 'crop_analysis')
                  _buildCropPDFContent(provider)
                else if (_selectedReportType == 'system_health')
                  _buildSystemHealthPDFContent(provider)
                else
                  pw.Text('Report data will be displayed here'),
              ],
            );
          },
        ),
      );

      // Save and share
      final output = await getTemporaryDirectory();
      final file = File(
          '${output.path}/aaywa_report_${_selectedReportType}_${DateTime.now().millisecondsSinceEpoch}.pdf');
      await file.writeAsBytes(await pdf.save());

      // Share the file
      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'AAYWA Platform Report',
        text: 'Generated report from AAYWA Platform',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report generated and shared successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error generating report: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isGenerating = false);
    }
  }

  pw.Widget _buildCohortPDFContent(AdminProvider provider) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text('Cohort Performance Summary',
            style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
        pw.SizedBox(height: 10),
        pw.TableHelper.fromTextArray(
          headers: [
            'Cohort',
            'Farmers',
            'Revenue (RWF)',
            'VSLA (RWF)',
            'Trust Score'
          ],
          data: provider.cohortAnalytics
              .map((cohort) => [
                    cohort.cohortName,
                    cohort.farmerCount.toString(),
                    cohort.totalRevenue.toStringAsFixed(0),
                    cohort.vslaSavings.toStringAsFixed(0),
                    cohort.avgTrustScore.toString(),
                  ])
              .toList(),
          headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          cellAlignment: pw.Alignment.centerLeft,
        ),
      ],
    );
  }

  pw.Widget _buildCropPDFContent(AdminProvider provider) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text('Crop Analysis Summary',
            style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
        pw.SizedBox(height: 10),
        pw.TableHelper.fromTextArray(
          headers: [
            'Crop Type',
            'Sales',
            'Quantity (kg)',
            'Avg Price',
            'Revenue (RWF)'
          ],
          data: provider.cropAnalytics
              .map((crop) => [
                    crop.cropType,
                    crop.saleCount.toString(),
                    crop.totalQuantityKg.toStringAsFixed(0),
                    crop.avgPricePerKg.toStringAsFixed(0),
                    crop.totalRevenue.toStringAsFixed(0),
                  ])
              .toList(),
          headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
          cellAlignment: pw.Alignment.centerLeft,
        ),
      ],
    );
  }

  pw.Widget _buildSystemHealthPDFContent(AdminProvider provider) {
    final health = provider.systemHealth;
    if (health == null) {
      return pw.Text('No system health data available');
    }

    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text('System Health Report',
            style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
        pw.SizedBox(height: 10),
        pw.Text('Data Quality Score: ${health.dataQuality.completenessScore}%',
            style: const pw.TextStyle(fontSize: 14)),
        pw.SizedBox(height: 5),
        pw.Text('Active Users (Daily): ${health.userActivity.dailyActive}',
            style: const pw.TextStyle(fontSize: 14)),
        pw.Text('Active Users (Weekly): ${health.userActivity.weeklyActive}',
            style: const pw.TextStyle(fontSize: 14)),
        pw.Text('Active Users (Monthly): ${health.userActivity.monthlyActive}',
            style: const pw.TextStyle(fontSize: 14)),
        pw.SizedBox(height: 10),
        pw.Text('Database Records:',
            style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
        pw.Text('  Farmers: ${health.database.farmers}',
            style: const pw.TextStyle(fontSize: 12)),
        pw.Text('  Sales: ${health.database.sales}',
            style: const pw.TextStyle(fontSize: 12)),
        pw.Text('  Trainings: ${health.database.trainings}',
            style: const pw.TextStyle(fontSize: 12)),
        pw.Text('  Invoices: ${health.database.invoices}',
            style: const pw.TextStyle(fontSize: 12)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundGray,
      appBar: AppBar(
        title: const Text('Report Builder'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          const Text(
            'SELECT REPORT TYPE',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.textMedium,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Report Type Selection
          ..._reportTypes.map((type) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                child: AaywaCard(
                  onTap: () =>
                      setState(() => _selectedReportType = type['id']!),
                  child: Row(
                    children: [
                      Radio<String>(
                        value: type['id']!,
                        groupValue: _selectedReportType,
                        onChanged: (value) =>
                            setState(() => _selectedReportType = value!),
                        activeColor: AppColors.primaryGreen,
                      ),
                      Icon(
                        _getIconData(type['icon']!),
                        color: _selectedReportType == type['id']
                            ? AppColors.primaryGreen
                            : AppColors.textMedium,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          type['name']!,
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: _selectedReportType == type['id']
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              )),

          const SizedBox(height: AppSpacing.lg),

          // Date Range Selection
          const Text(
            'DATE RANGE (OPTIONAL)',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.textMedium,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          AaywaCard(
            onTap: _selectDateRange,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Select Period',
                      style: AppTypography.bodyMedium,
                    ),
                    if (_dateRange != null)
                      Text(
                        '${_dateRange!.start.toString().substring(0, 10)} - ${_dateRange!.end.toString().substring(0, 10)}',
                        style: AppTypography.caption
                            .copyWith(color: AppColors.textMedium),
                      ),
                  ],
                ),
                Icon(
                  Icons.calendar_today,
                  color: _dateRange != null
                      ? AppColors.primaryGreen
                      : AppColors.textMedium,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // Generate Button
          ElevatedButton.icon(
            onPressed: _isGenerating ? null : _generatePDFReport,
            icon: _isGenerating
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.picture_as_pdf),
            label:
                Text(_isGenerating ? 'Generating...' : 'Generate PDF Report'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              textStyle: AppTypography.button,
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Info Card
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: const Color(0xFF6366F1).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                  color: const Color(0xFF6366F1).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline,
                    color: Color(0xFF6366F1), size: 20),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'The report will be generated as a PDF and can be shared via email, messaging, or other apps.',
                    style: AppTypography.caption
                        .copyWith(color: AppColors.textDark),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
