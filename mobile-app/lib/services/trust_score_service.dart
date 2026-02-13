import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';

class TrustScoreService {
  final String baseUrl = Environment.apiBaseUrl;

  /// Fetch Trust Score from backend
  Future<TrustScoreData> fetchTrustScore(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers/me/trust-score'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return TrustScoreData.fromJson(data);
      } else {
        throw Exception('Failed to fetch trust score: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Trust score fetch error: $e');
    }
  }

  /// Fetch Learning Path
  Future<LearningPathData> fetchLearningPath(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers/me/learning-path'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return LearningPathData.fromJson(data);
      } else {
        throw Exception(
            'Failed to fetch learning path: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Learning path fetch error: $e');
    }
  }

  /// Fetch Market Intelligence
  Future<MarketIntelData> fetchMarketIntel(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers/me/market-intel'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return MarketIntelData.fromJson(data);
      } else {
        throw Exception('Failed to fetch market intel: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Market intel fetch error: $e');
    }
  }

  /// Fetch Resource Qualification
  Future<ResourceQualificationData> fetchResourceQualification(
      String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers/me/resource-qualification'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return ResourceQualificationData.fromJson(data);
      } else {
        throw Exception(
            'Failed to fetch qualifications: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Qualification fetch error: $e');
    }
  }
}

// Data Models

class TrustScoreData {
  final int trustScore;
  final TrustScoreBreakdown breakdown;

  TrustScoreData({
    required this.trustScore,
    required this.breakdown,
  });

  factory TrustScoreData.fromJson(Map<String, dynamic> json) {
    return TrustScoreData(
      trustScore: json['trust_score'] ?? 0,
      breakdown: TrustScoreBreakdown.fromJson(json['breakdown'] ?? {}),
    );
  }
}

class TrustScoreBreakdown {
  final int vsla;
  final int repayment;
  final int agronomic;

  TrustScoreBreakdown({
    required this.vsla,
    required this.repayment,
    required this.agronomic,
  });

  factory TrustScoreBreakdown.fromJson(Map<String, dynamic> json) {
    return TrustScoreBreakdown(
      vsla: json['vsla'] ?? 0,
      repayment: json['repayment'] ?? 0,
      agronomic: json['agronomic'] ?? 0,
    );
  }
}

class LearningPathData {
  final String croppingSystem;
  final int completionPercentage;
  final List<LearningModule> recommendations;

  LearningPathData({
    required this.croppingSystem,
    required this.completionPercentage,
    required this.recommendations,
  });

  factory LearningPathData.fromJson(Map<String, dynamic> json) {
    return LearningPathData(
      croppingSystem: json['cropping_system'] ?? 'avocado',
      completionPercentage: json['completion_percentage'] ?? 0,
      recommendations: (json['recommendations'] as List<dynamic>?)
              ?.map((m) => LearningModule.fromJson(m))
              .toList() ??
          [],
    );
  }
}

class LearningModule {
  final String topic;
  final int priority;

  LearningModule({
    required this.topic,
    required this.priority,
  });

  factory LearningModule.fromJson(Map<String, dynamic> json) {
    return LearningModule(
      topic: json['topic'] ?? '',
      priority: json['priority'] ?? 0,
    );
  }

  String get displayName {
    return topic
        .split('_')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}

class MarketIntelData {
  final String cropType;
  final List<MarketPrice> currentPrices;

  MarketIntelData({
    required this.cropType,
    required this.currentPrices,
  });

  factory MarketIntelData.fromJson(Map<String, dynamic> json) {
    return MarketIntelData(
      cropType: json['crop_type'] ?? '',
      currentPrices: (json['current_prices'] as List<dynamic>?)
              ?.map((p) => MarketPrice.fromJson(p))
              .toList() ??
          [],
    );
  }
}

class MarketPrice {
  final String qualityGrade;
  final double pricePerKg;
  final String? marketLocation;
  final String? trend;
  final String? demandLevel;

  MarketPrice({
    required this.qualityGrade,
    required this.pricePerKg,
    this.marketLocation,
    this.trend,
    this.demandLevel,
  });

  factory MarketPrice.fromJson(Map<String, dynamic> json) {
    return MarketPrice(
      qualityGrade: json['quality_grade'] ?? '',
      pricePerKg: (json['price_per_kg'] ?? 0).toDouble(),
      marketLocation: json['market_location'],
      trend: json['trend'],
      demandLevel: json['demand_level'],
    );
  }
}

class ResourceQualificationData {
  final List<ProgramQualification> qualifications;
  final QualificationSummary summary;

  ResourceQualificationData({
    required this.qualifications,
    required this.summary,
  });

  factory ResourceQualificationData.fromJson(Map<String, dynamic> json) {
    return ResourceQualificationData(
      qualifications: (json['qualifications'] as List<dynamic>?)
              ?.map((q) => ProgramQualification.fromJson(q))
              .toList() ??
          [],
      summary: QualificationSummary.fromJson(json['summary'] ?? {}),
    );
  }
}

class ProgramQualification {
  final String program;
  final bool qualified;
  final Map<String, dynamic> requirements;

  ProgramQualification({
    required this.program,
    required this.qualified,
    required this.requirements,
  });

  factory ProgramQualification.fromJson(Map<String, dynamic> json) {
    return ProgramQualification(
      program: json['program'] ?? '',
      qualified: json['qualified'] ?? false,
      requirements: json['requirements'] ?? {},
    );
  }
}

class QualificationSummary {
  final int qualifiedPrograms;
  final int totalPrograms;

  QualificationSummary({
    required this.qualifiedPrograms,
    required this.totalPrograms,
  });

  factory QualificationSummary.fromJson(Map<String, dynamic> json) {
    return QualificationSummary(
      qualifiedPrograms: json['qualified_programs'] ?? 0,
      totalPrograms: json['total_programs'] ?? 0,
    );
  }
}
