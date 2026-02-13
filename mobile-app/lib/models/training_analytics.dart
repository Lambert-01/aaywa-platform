/// Model for quiz questions used in training effectiveness analytics
class QuizQuestion {
  final String id;
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String? explanation;

  QuizQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    this.explanation,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: json['id'] as String,
      question: json['question'] as String,
      options: List<String>.from(json['options'] as List),
      correctAnswerIndex: json['correctAnswerIndex'] as int,
      explanation: json['explanation'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'options': options,
      'correctAnswerIndex': correctAnswerIndex,
      'explanation': explanation,
    };
  }
}

/// Model for quiz responses
class QuizResponse {
  final String questionId;
  final int selectedAnswerIndex;
  final bool isCorrect;
  final DateTime answeredAt;

  QuizResponse({
    required this.questionId,
    required this.selectedAnswerIndex,
    required this.isCorrect,
    required this.answeredAt,
  });

  factory QuizResponse.fromJson(Map<String, dynamic> json) {
    return QuizResponse(
      questionId: json['questionId'] as String,
      selectedAnswerIndex: json['selectedAnswerIndex'] as int,
      isCorrect: json['isCorrect'] as bool,
      answeredAt: DateTime.parse(json['answeredAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'selectedAnswerIndex': selectedAnswerIndex,
      'isCorrect': isCorrect,
      'answeredAt': answeredAt.toIso8601String(),
    };
  }
}

/// Model for training session analytics
class TrainingAnalytics {
  final String trainingId;
  final String trainingTitle;
  final DateTime startTime;
  final DateTime? endTime;

  // Pre/Post Quiz Results
  final List<QuizResponse> preQuizResponses;
  final List<QuizResponse> postQuizResponses;

  // Engagement Metrics
  final Map<int, int> slideTimeSpent; // slideIndex -> seconds
  final int questionsAsked;
  final List<String> attendeeIds;
  final int completedCount;

  TrainingAnalytics({
    required this.trainingId,
    required this.trainingTitle,
    required this.startTime,
    this.endTime,
    this.preQuizResponses = const [],
    this.postQuizResponses = const [],
    this.slideTimeSpent = const {},
    this.questionsAsked = 0,
    this.attendeeIds = const [],
    this.completedCount = 0,
  });

  // Calculate knowledge gain (% improvement from pre to post quiz)
  double get knowledgeGain {
    if (preQuizResponses.isEmpty || postQuizResponses.isEmpty) return 0.0;

    final preScore = preQuizResponses.where((r) => r.isCorrect).length /
        preQuizResponses.length;
    final postScore = postQuizResponses.where((r) => r.isCorrect).length /
        postQuizResponses.length;

    return ((postScore - preScore) * 100).clamp(0.0, 100.0);
  }

  // Calculate average pre-quiz score
  double get preQuizScore {
    if (preQuizResponses.isEmpty) return 0.0;
    return (preQuizResponses.where((r) => r.isCorrect).length /
        preQuizResponses.length *
        100);
  }

  // Calculate average post-quiz score
  double get postQuizScore {
    if (postQuizResponses.isEmpty) return 0.0;
    return (postQuizResponses.where((r) => r.isCorrect).length /
        postQuizResponses.length *
        100);
  }

  // Calculate completion rate
  double get completionRate {
    if (attendeeIds.isEmpty) return 0.0;
    return (completedCount / attendeeIds.length * 100).clamp(0.0, 100.0);
  }

  // Calculate total training duration
  Duration get duration {
    if (endTime == null) return const Duration();
    return endTime!.difference(startTime);
  }

  // Calculate average time per slide
  double get averageTimePerSlide {
    if (slideTimeSpent.isEmpty) return 0.0;
    final totalTime = slideTimeSpent.values.reduce((a, b) => a + b);
    return totalTime / slideTimeSpent.length;
  }

  // Calculate engagement score (0-100)
  double get engagementScore {
    if (attendeeIds.isEmpty) return 0.0;

    // Factors: completion rate (40%), questions asked (30%), time spent (30%)
    final completionScore = completionRate * 0.4;
    final questionsScore =
        (questionsAsked / attendeeIds.length * 10).clamp(0, 30);
    final timeScore =
        (averageTimePerSlide / 60 * 30).clamp(0, 30); // Assume 60s is ideal

    return (completionScore + questionsScore + timeScore).clamp(0.0, 100.0);
  }

  // Overall effectiveness score
  double get effectivenessScore {
    // Weighted average: knowledge gain (50%), engagement (30%), completion (20%)
    return (knowledgeGain * 0.5 + engagementScore * 0.3 + completionRate * 0.2)
        .clamp(0.0, 100.0);
  }

  factory TrainingAnalytics.fromJson(Map<String, dynamic> json) {
    return TrainingAnalytics(
      trainingId: json['trainingId'] as String,
      trainingTitle: json['trainingTitle'] as String,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: json['endTime'] != null
          ? DateTime.parse(json['endTime'] as String)
          : null,
      preQuizResponses: (json['preQuizResponses'] as List?)
              ?.map((e) => QuizResponse.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      postQuizResponses: (json['postQuizResponses'] as List?)
              ?.map((e) => QuizResponse.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      slideTimeSpent: Map<int, int>.from(json['slideTimeSpent'] as Map? ?? {}),
      questionsAsked: json['questionsAsked'] as int? ?? 0,
      attendeeIds: List<String>.from(json['attendeeIds'] as List? ?? []),
      completedCount: json['completedCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'trainingId': trainingId,
      'trainingTitle': trainingTitle,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'preQuizResponses': preQuizResponses.map((r) => r.toJson()).toList(),
      'postQuizResponses': postQuizResponses.map((r) => r.toJson()).toList(),
      'slideTimeSpent': slideTimeSpent,
      'questionsAsked': questionsAsked,
      'attendeeIds': attendeeIds,
      'completedCount': completedCount,
    };
  }

  TrainingAnalytics copyWith({
    String? trainingId,
    String? trainingTitle,
    DateTime? startTime,
    DateTime? endTime,
    List<QuizResponse>? preQuizResponses,
    List<QuizResponse>? postQuizResponses,
    Map<int, int>? slideTimeSpent,
    int? questionsAsked,
    List<String>? attendeeIds,
    int? completedCount,
  }) {
    return TrainingAnalytics(
      trainingId: trainingId ?? this.trainingId,
      trainingTitle: trainingTitle ?? this.trainingTitle,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      preQuizResponses: preQuizResponses ?? this.preQuizResponses,
      postQuizResponses: postQuizResponses ?? this.postQuizResponses,
      slideTimeSpent: slideTimeSpent ?? this.slideTimeSpent,
      questionsAsked: questionsAsked ?? this.questionsAsked,
      attendeeIds: attendeeIds ?? this.attendeeIds,
      completedCount: completedCount ?? this.completedCount,
    );
  }
}
