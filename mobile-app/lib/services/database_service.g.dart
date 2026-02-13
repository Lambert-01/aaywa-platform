// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database_service.dart';

// ignore_for_file: type=lint
class $FarmersTable extends Farmers with TableInfo<$FarmersTable, Farmer> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $FarmersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _firstNameMeta =
      const VerificationMeta('firstName');
  @override
  late final GeneratedColumn<String> firstName = GeneratedColumn<String>(
      'first_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastNameMeta =
      const VerificationMeta('lastName');
  @override
  late final GeneratedColumn<String> lastName = GeneratedColumn<String>(
      'last_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nationalIdMeta =
      const VerificationMeta('nationalId');
  @override
  late final GeneratedColumn<String> nationalId = GeneratedColumn<String>(
      'national_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cohortIdMeta =
      const VerificationMeta('cohortId');
  @override
  late final GeneratedColumn<String> cohortId = GeneratedColumn<String>(
      'cohort_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _vslaIdMeta = const VerificationMeta('vslaId');
  @override
  late final GeneratedColumn<String> vslaId = GeneratedColumn<String>(
      'vsla_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _householdTypeMeta =
      const VerificationMeta('householdType');
  @override
  late final GeneratedColumn<String> householdType = GeneratedColumn<String>(
      'household_type', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _landSizeHaMeta =
      const VerificationMeta('landSizeHa');
  @override
  late final GeneratedColumn<double> landSizeHa = GeneratedColumn<double>(
      'land_size_ha', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _plotBoundaryCoordinatesMeta =
      const VerificationMeta('plotBoundaryCoordinates');
  @override
  late final GeneratedColumn<String> plotBoundaryCoordinates =
      GeneratedColumn<String>('plot_boundary_coordinates', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _locationStrMeta =
      const VerificationMeta('locationStr');
  @override
  late final GeneratedColumn<String> locationStr = GeneratedColumn<String>(
      'location_str', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($FarmersTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _serverUpdatedAtMeta =
      const VerificationMeta('serverUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> serverUpdatedAt =
      GeneratedColumn<DateTime>('server_updated_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastFailureReasonMeta =
      const VerificationMeta('lastFailureReason');
  @override
  late final GeneratedColumn<String> lastFailureReason =
      GeneratedColumn<String>('last_failure_reason', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        firstName,
        lastName,
        nationalId,
        phone,
        cohortId,
        vslaId,
        householdType,
        landSizeHa,
        plotBoundaryCoordinates,
        locationStr,
        syncStatus,
        localUpdatedAt,
        serverUpdatedAt,
        lastFailureReason
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'farmers';
  @override
  VerificationContext validateIntegrity(Insertable<Farmer> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('first_name')) {
      context.handle(_firstNameMeta,
          firstName.isAcceptableOrUnknown(data['first_name']!, _firstNameMeta));
    } else if (isInserting) {
      context.missing(_firstNameMeta);
    }
    if (data.containsKey('last_name')) {
      context.handle(_lastNameMeta,
          lastName.isAcceptableOrUnknown(data['last_name']!, _lastNameMeta));
    } else if (isInserting) {
      context.missing(_lastNameMeta);
    }
    if (data.containsKey('national_id')) {
      context.handle(
          _nationalIdMeta,
          nationalId.isAcceptableOrUnknown(
              data['national_id']!, _nationalIdMeta));
    } else if (isInserting) {
      context.missing(_nationalIdMeta);
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    }
    if (data.containsKey('cohort_id')) {
      context.handle(_cohortIdMeta,
          cohortId.isAcceptableOrUnknown(data['cohort_id']!, _cohortIdMeta));
    }
    if (data.containsKey('vsla_id')) {
      context.handle(_vslaIdMeta,
          vslaId.isAcceptableOrUnknown(data['vsla_id']!, _vslaIdMeta));
    }
    if (data.containsKey('household_type')) {
      context.handle(
          _householdTypeMeta,
          householdType.isAcceptableOrUnknown(
              data['household_type']!, _householdTypeMeta));
    }
    if (data.containsKey('land_size_ha')) {
      context.handle(
          _landSizeHaMeta,
          landSizeHa.isAcceptableOrUnknown(
              data['land_size_ha']!, _landSizeHaMeta));
    }
    if (data.containsKey('plot_boundary_coordinates')) {
      context.handle(
          _plotBoundaryCoordinatesMeta,
          plotBoundaryCoordinates.isAcceptableOrUnknown(
              data['plot_boundary_coordinates']!,
              _plotBoundaryCoordinatesMeta));
    }
    if (data.containsKey('location_str')) {
      context.handle(
          _locationStrMeta,
          locationStr.isAcceptableOrUnknown(
              data['location_str']!, _locationStrMeta));
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
          _serverUpdatedAtMeta,
          serverUpdatedAt.isAcceptableOrUnknown(
              data['server_updated_at']!, _serverUpdatedAtMeta));
    }
    if (data.containsKey('last_failure_reason')) {
      context.handle(
          _lastFailureReasonMeta,
          lastFailureReason.isAcceptableOrUnknown(
              data['last_failure_reason']!, _lastFailureReasonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Farmer map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Farmer(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      firstName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}first_name'])!,
      lastName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_name'])!,
      nationalId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}national_id'])!,
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone']),
      cohortId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}cohort_id']),
      vslaId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}vsla_id']),
      householdType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}household_type']),
      landSizeHa: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}land_size_ha']),
      plotBoundaryCoordinates: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}plot_boundary_coordinates']),
      locationStr: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}location_str']),
      syncStatus: $FarmersTable.$convertersyncStatus.fromSql(attachedDatabase
          .typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}server_updated_at']),
      lastFailureReason: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}last_failure_reason']),
    );
  }

  @override
  $FarmersTable createAlias(String alias) {
    return $FarmersTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class Farmer extends DataClass implements Insertable<Farmer> {
  final int id;
  final String? remoteId;
  final String firstName;
  final String lastName;
  final String nationalId;
  final String? phone;
  final String? cohortId;
  final String? vslaId;
  final String? householdType;
  final double? landSizeHa;
  final String? plotBoundaryCoordinates;
  final String? locationStr;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  final DateTime? serverUpdatedAt;
  final String? lastFailureReason;
  const Farmer(
      {required this.id,
      this.remoteId,
      required this.firstName,
      required this.lastName,
      required this.nationalId,
      this.phone,
      this.cohortId,
      this.vslaId,
      this.householdType,
      this.landSizeHa,
      this.plotBoundaryCoordinates,
      this.locationStr,
      required this.syncStatus,
      required this.localUpdatedAt,
      this.serverUpdatedAt,
      this.lastFailureReason});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['first_name'] = Variable<String>(firstName);
    map['last_name'] = Variable<String>(lastName);
    map['national_id'] = Variable<String>(nationalId);
    if (!nullToAbsent || phone != null) {
      map['phone'] = Variable<String>(phone);
    }
    if (!nullToAbsent || cohortId != null) {
      map['cohort_id'] = Variable<String>(cohortId);
    }
    if (!nullToAbsent || vslaId != null) {
      map['vsla_id'] = Variable<String>(vslaId);
    }
    if (!nullToAbsent || householdType != null) {
      map['household_type'] = Variable<String>(householdType);
    }
    if (!nullToAbsent || landSizeHa != null) {
      map['land_size_ha'] = Variable<double>(landSizeHa);
    }
    if (!nullToAbsent || plotBoundaryCoordinates != null) {
      map['plot_boundary_coordinates'] =
          Variable<String>(plotBoundaryCoordinates);
    }
    if (!nullToAbsent || locationStr != null) {
      map['location_str'] = Variable<String>(locationStr);
    }
    {
      map['sync_status'] =
          Variable<int>($FarmersTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt);
    }
    if (!nullToAbsent || lastFailureReason != null) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason);
    }
    return map;
  }

  FarmersCompanion toCompanion(bool nullToAbsent) {
    return FarmersCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      firstName: Value(firstName),
      lastName: Value(lastName),
      nationalId: Value(nationalId),
      phone:
          phone == null && nullToAbsent ? const Value.absent() : Value(phone),
      cohortId: cohortId == null && nullToAbsent
          ? const Value.absent()
          : Value(cohortId),
      vslaId:
          vslaId == null && nullToAbsent ? const Value.absent() : Value(vslaId),
      householdType: householdType == null && nullToAbsent
          ? const Value.absent()
          : Value(householdType),
      landSizeHa: landSizeHa == null && nullToAbsent
          ? const Value.absent()
          : Value(landSizeHa),
      plotBoundaryCoordinates: plotBoundaryCoordinates == null && nullToAbsent
          ? const Value.absent()
          : Value(plotBoundaryCoordinates),
      locationStr: locationStr == null && nullToAbsent
          ? const Value.absent()
          : Value(locationStr),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
      lastFailureReason: lastFailureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(lastFailureReason),
    );
  }

  factory Farmer.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Farmer(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      firstName: serializer.fromJson<String>(json['firstName']),
      lastName: serializer.fromJson<String>(json['lastName']),
      nationalId: serializer.fromJson<String>(json['nationalId']),
      phone: serializer.fromJson<String?>(json['phone']),
      cohortId: serializer.fromJson<String?>(json['cohortId']),
      vslaId: serializer.fromJson<String?>(json['vslaId']),
      householdType: serializer.fromJson<String?>(json['householdType']),
      landSizeHa: serializer.fromJson<double?>(json['landSizeHa']),
      plotBoundaryCoordinates:
          serializer.fromJson<String?>(json['plotBoundaryCoordinates']),
      locationStr: serializer.fromJson<String?>(json['locationStr']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
      serverUpdatedAt: serializer.fromJson<DateTime?>(json['serverUpdatedAt']),
      lastFailureReason:
          serializer.fromJson<String?>(json['lastFailureReason']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'firstName': serializer.toJson<String>(firstName),
      'lastName': serializer.toJson<String>(lastName),
      'nationalId': serializer.toJson<String>(nationalId),
      'phone': serializer.toJson<String?>(phone),
      'cohortId': serializer.toJson<String?>(cohortId),
      'vslaId': serializer.toJson<String?>(vslaId),
      'householdType': serializer.toJson<String?>(householdType),
      'landSizeHa': serializer.toJson<double?>(landSizeHa),
      'plotBoundaryCoordinates':
          serializer.toJson<String?>(plotBoundaryCoordinates),
      'locationStr': serializer.toJson<String?>(locationStr),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
      'serverUpdatedAt': serializer.toJson<DateTime?>(serverUpdatedAt),
      'lastFailureReason': serializer.toJson<String?>(lastFailureReason),
    };
  }

  Farmer copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          String? firstName,
          String? lastName,
          String? nationalId,
          Value<String?> phone = const Value.absent(),
          Value<String?> cohortId = const Value.absent(),
          Value<String?> vslaId = const Value.absent(),
          Value<String?> householdType = const Value.absent(),
          Value<double?> landSizeHa = const Value.absent(),
          Value<String?> plotBoundaryCoordinates = const Value.absent(),
          Value<String?> locationStr = const Value.absent(),
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt,
          Value<DateTime?> serverUpdatedAt = const Value.absent(),
          Value<String?> lastFailureReason = const Value.absent()}) =>
      Farmer(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        nationalId: nationalId ?? this.nationalId,
        phone: phone.present ? phone.value : this.phone,
        cohortId: cohortId.present ? cohortId.value : this.cohortId,
        vslaId: vslaId.present ? vslaId.value : this.vslaId,
        householdType:
            householdType.present ? householdType.value : this.householdType,
        landSizeHa: landSizeHa.present ? landSizeHa.value : this.landSizeHa,
        plotBoundaryCoordinates: plotBoundaryCoordinates.present
            ? plotBoundaryCoordinates.value
            : this.plotBoundaryCoordinates,
        locationStr: locationStr.present ? locationStr.value : this.locationStr,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
        serverUpdatedAt: serverUpdatedAt.present
            ? serverUpdatedAt.value
            : this.serverUpdatedAt,
        lastFailureReason: lastFailureReason.present
            ? lastFailureReason.value
            : this.lastFailureReason,
      );
  @override
  String toString() {
    return (StringBuffer('Farmer(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('nationalId: $nationalId, ')
          ..write('phone: $phone, ')
          ..write('cohortId: $cohortId, ')
          ..write('vslaId: $vslaId, ')
          ..write('householdType: $householdType, ')
          ..write('landSizeHa: $landSizeHa, ')
          ..write('plotBoundaryCoordinates: $plotBoundaryCoordinates, ')
          ..write('locationStr: $locationStr, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      remoteId,
      firstName,
      lastName,
      nationalId,
      phone,
      cohortId,
      vslaId,
      householdType,
      landSizeHa,
      plotBoundaryCoordinates,
      locationStr,
      syncStatus,
      localUpdatedAt,
      serverUpdatedAt,
      lastFailureReason);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Farmer &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.firstName == this.firstName &&
          other.lastName == this.lastName &&
          other.nationalId == this.nationalId &&
          other.phone == this.phone &&
          other.cohortId == this.cohortId &&
          other.vslaId == this.vslaId &&
          other.householdType == this.householdType &&
          other.landSizeHa == this.landSizeHa &&
          other.plotBoundaryCoordinates == this.plotBoundaryCoordinates &&
          other.locationStr == this.locationStr &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt &&
          other.serverUpdatedAt == this.serverUpdatedAt &&
          other.lastFailureReason == this.lastFailureReason);
}

class FarmersCompanion extends UpdateCompanion<Farmer> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String> firstName;
  final Value<String> lastName;
  final Value<String> nationalId;
  final Value<String?> phone;
  final Value<String?> cohortId;
  final Value<String?> vslaId;
  final Value<String?> householdType;
  final Value<double?> landSizeHa;
  final Value<String?> plotBoundaryCoordinates;
  final Value<String?> locationStr;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  final Value<DateTime?> serverUpdatedAt;
  final Value<String?> lastFailureReason;
  const FarmersCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.nationalId = const Value.absent(),
    this.phone = const Value.absent(),
    this.cohortId = const Value.absent(),
    this.vslaId = const Value.absent(),
    this.householdType = const Value.absent(),
    this.landSizeHa = const Value.absent(),
    this.plotBoundaryCoordinates = const Value.absent(),
    this.locationStr = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  });
  FarmersCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    required String firstName,
    required String lastName,
    required String nationalId,
    this.phone = const Value.absent(),
    this.cohortId = const Value.absent(),
    this.vslaId = const Value.absent(),
    this.householdType = const Value.absent(),
    this.landSizeHa = const Value.absent(),
    this.plotBoundaryCoordinates = const Value.absent(),
    this.locationStr = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  })  : firstName = Value(firstName),
        lastName = Value(lastName),
        nationalId = Value(nationalId);
  static Insertable<Farmer> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? firstName,
    Expression<String>? lastName,
    Expression<String>? nationalId,
    Expression<String>? phone,
    Expression<String>? cohortId,
    Expression<String>? vslaId,
    Expression<String>? householdType,
    Expression<double>? landSizeHa,
    Expression<String>? plotBoundaryCoordinates,
    Expression<String>? locationStr,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
    Expression<DateTime>? serverUpdatedAt,
    Expression<String>? lastFailureReason,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (nationalId != null) 'national_id': nationalId,
      if (phone != null) 'phone': phone,
      if (cohortId != null) 'cohort_id': cohortId,
      if (vslaId != null) 'vsla_id': vslaId,
      if (householdType != null) 'household_type': householdType,
      if (landSizeHa != null) 'land_size_ha': landSizeHa,
      if (plotBoundaryCoordinates != null)
        'plot_boundary_coordinates': plotBoundaryCoordinates,
      if (locationStr != null) 'location_str': locationStr,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (lastFailureReason != null) 'last_failure_reason': lastFailureReason,
    });
  }

  FarmersCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String>? firstName,
      Value<String>? lastName,
      Value<String>? nationalId,
      Value<String?>? phone,
      Value<String?>? cohortId,
      Value<String?>? vslaId,
      Value<String?>? householdType,
      Value<double?>? landSizeHa,
      Value<String?>? plotBoundaryCoordinates,
      Value<String?>? locationStr,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt,
      Value<DateTime?>? serverUpdatedAt,
      Value<String?>? lastFailureReason}) {
    return FarmersCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      nationalId: nationalId ?? this.nationalId,
      phone: phone ?? this.phone,
      cohortId: cohortId ?? this.cohortId,
      vslaId: vslaId ?? this.vslaId,
      householdType: householdType ?? this.householdType,
      landSizeHa: landSizeHa ?? this.landSizeHa,
      plotBoundaryCoordinates:
          plotBoundaryCoordinates ?? this.plotBoundaryCoordinates,
      locationStr: locationStr ?? this.locationStr,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      lastFailureReason: lastFailureReason ?? this.lastFailureReason,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (firstName.present) {
      map['first_name'] = Variable<String>(firstName.value);
    }
    if (lastName.present) {
      map['last_name'] = Variable<String>(lastName.value);
    }
    if (nationalId.present) {
      map['national_id'] = Variable<String>(nationalId.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (cohortId.present) {
      map['cohort_id'] = Variable<String>(cohortId.value);
    }
    if (vslaId.present) {
      map['vsla_id'] = Variable<String>(vslaId.value);
    }
    if (householdType.present) {
      map['household_type'] = Variable<String>(householdType.value);
    }
    if (landSizeHa.present) {
      map['land_size_ha'] = Variable<double>(landSizeHa.value);
    }
    if (plotBoundaryCoordinates.present) {
      map['plot_boundary_coordinates'] =
          Variable<String>(plotBoundaryCoordinates.value);
    }
    if (locationStr.present) {
      map['location_str'] = Variable<String>(locationStr.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $FarmersTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt.value);
    }
    if (lastFailureReason.present) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FarmersCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('nationalId: $nationalId, ')
          ..write('phone: $phone, ')
          ..write('cohortId: $cohortId, ')
          ..write('vslaId: $vslaId, ')
          ..write('householdType: $householdType, ')
          ..write('landSizeHa: $landSizeHa, ')
          ..write('plotBoundaryCoordinates: $plotBoundaryCoordinates, ')
          ..write('locationStr: $locationStr, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }
}

class $SalesTable extends Sales with TableInfo<$SalesTable, Sale> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SalesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cropTypeMeta =
      const VerificationMeta('cropType');
  @override
  late final GeneratedColumn<String> cropType = GeneratedColumn<String>(
      'crop_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _quantityKgMeta =
      const VerificationMeta('quantityKg');
  @override
  late final GeneratedColumn<double> quantityKg = GeneratedColumn<double>(
      'quantity_kg', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _pricePerKgMeta =
      const VerificationMeta('pricePerKg');
  @override
  late final GeneratedColumn<double> pricePerKg = GeneratedColumn<double>(
      'price_per_kg', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _grossAmountMeta =
      const VerificationMeta('grossAmount');
  @override
  late final GeneratedColumn<double> grossAmount = GeneratedColumn<double>(
      'gross_amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _farmerSplitAmountMeta =
      const VerificationMeta('farmerSplitAmount');
  @override
  late final GeneratedColumn<double> farmerSplitAmount =
      GeneratedColumn<double>('farmer_split_amount', aliasedName, false,
          type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _sanzaSplitAmountMeta =
      const VerificationMeta('sanzaSplitAmount');
  @override
  late final GeneratedColumn<double> sanzaSplitAmount = GeneratedColumn<double>(
      'sanza_split_amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _inputDeductionAmountMeta =
      const VerificationMeta('inputDeductionAmount');
  @override
  late final GeneratedColumn<double> inputDeductionAmount =
      GeneratedColumn<double>('input_deduction_amount', aliasedName, false,
          type: DriftSqlType.double,
          requiredDuringInsert: false,
          defaultValue: const Constant(0.0));
  static const VerificationMeta _transactionDateMeta =
      const VerificationMeta('transactionDate');
  @override
  late final GeneratedColumn<DateTime> transactionDate =
      GeneratedColumn<DateTime>('transaction_date', aliasedName, false,
          type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($SalesTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _serverUpdatedAtMeta =
      const VerificationMeta('serverUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> serverUpdatedAt =
      GeneratedColumn<DateTime>('server_updated_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastFailureReasonMeta =
      const VerificationMeta('lastFailureReason');
  @override
  late final GeneratedColumn<String> lastFailureReason =
      GeneratedColumn<String>('last_failure_reason', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        farmerId,
        cropType,
        quantityKg,
        pricePerKg,
        grossAmount,
        farmerSplitAmount,
        sanzaSplitAmount,
        inputDeductionAmount,
        transactionDate,
        syncStatus,
        localUpdatedAt,
        serverUpdatedAt,
        lastFailureReason
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sales';
  @override
  VerificationContext validateIntegrity(Insertable<Sale> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    }
    if (data.containsKey('crop_type')) {
      context.handle(_cropTypeMeta,
          cropType.isAcceptableOrUnknown(data['crop_type']!, _cropTypeMeta));
    } else if (isInserting) {
      context.missing(_cropTypeMeta);
    }
    if (data.containsKey('quantity_kg')) {
      context.handle(
          _quantityKgMeta,
          quantityKg.isAcceptableOrUnknown(
              data['quantity_kg']!, _quantityKgMeta));
    } else if (isInserting) {
      context.missing(_quantityKgMeta);
    }
    if (data.containsKey('price_per_kg')) {
      context.handle(
          _pricePerKgMeta,
          pricePerKg.isAcceptableOrUnknown(
              data['price_per_kg']!, _pricePerKgMeta));
    } else if (isInserting) {
      context.missing(_pricePerKgMeta);
    }
    if (data.containsKey('gross_amount')) {
      context.handle(
          _grossAmountMeta,
          grossAmount.isAcceptableOrUnknown(
              data['gross_amount']!, _grossAmountMeta));
    } else if (isInserting) {
      context.missing(_grossAmountMeta);
    }
    if (data.containsKey('farmer_split_amount')) {
      context.handle(
          _farmerSplitAmountMeta,
          farmerSplitAmount.isAcceptableOrUnknown(
              data['farmer_split_amount']!, _farmerSplitAmountMeta));
    } else if (isInserting) {
      context.missing(_farmerSplitAmountMeta);
    }
    if (data.containsKey('sanza_split_amount')) {
      context.handle(
          _sanzaSplitAmountMeta,
          sanzaSplitAmount.isAcceptableOrUnknown(
              data['sanza_split_amount']!, _sanzaSplitAmountMeta));
    } else if (isInserting) {
      context.missing(_sanzaSplitAmountMeta);
    }
    if (data.containsKey('input_deduction_amount')) {
      context.handle(
          _inputDeductionAmountMeta,
          inputDeductionAmount.isAcceptableOrUnknown(
              data['input_deduction_amount']!, _inputDeductionAmountMeta));
    }
    if (data.containsKey('transaction_date')) {
      context.handle(
          _transactionDateMeta,
          transactionDate.isAcceptableOrUnknown(
              data['transaction_date']!, _transactionDateMeta));
    } else if (isInserting) {
      context.missing(_transactionDateMeta);
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
          _serverUpdatedAtMeta,
          serverUpdatedAt.isAcceptableOrUnknown(
              data['server_updated_at']!, _serverUpdatedAtMeta));
    }
    if (data.containsKey('last_failure_reason')) {
      context.handle(
          _lastFailureReasonMeta,
          lastFailureReason.isAcceptableOrUnknown(
              data['last_failure_reason']!, _lastFailureReasonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Sale map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Sale(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id']),
      cropType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}crop_type'])!,
      quantityKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}quantity_kg'])!,
      pricePerKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}price_per_kg'])!,
      grossAmount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}gross_amount'])!,
      farmerSplitAmount: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}farmer_split_amount'])!,
      sanzaSplitAmount: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}sanza_split_amount'])!,
      inputDeductionAmount: attachedDatabase.typeMapping.read(
          DriftSqlType.double,
          data['${effectivePrefix}input_deduction_amount'])!,
      transactionDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}transaction_date'])!,
      syncStatus: $SalesTable.$convertersyncStatus.fromSql(attachedDatabase
          .typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}server_updated_at']),
      lastFailureReason: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}last_failure_reason']),
    );
  }

  @override
  $SalesTable createAlias(String alias) {
    return $SalesTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class Sale extends DataClass implements Insertable<Sale> {
  final int id;
  final String? remoteId;
  final String? farmerId;
  final String cropType;
  final double quantityKg;
  final double pricePerKg;
  final double grossAmount;
  final double farmerSplitAmount;
  final double sanzaSplitAmount;
  final double inputDeductionAmount;
  final DateTime transactionDate;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  final DateTime? serverUpdatedAt;
  final String? lastFailureReason;
  const Sale(
      {required this.id,
      this.remoteId,
      this.farmerId,
      required this.cropType,
      required this.quantityKg,
      required this.pricePerKg,
      required this.grossAmount,
      required this.farmerSplitAmount,
      required this.sanzaSplitAmount,
      required this.inputDeductionAmount,
      required this.transactionDate,
      required this.syncStatus,
      required this.localUpdatedAt,
      this.serverUpdatedAt,
      this.lastFailureReason});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    if (!nullToAbsent || farmerId != null) {
      map['farmer_id'] = Variable<String>(farmerId);
    }
    map['crop_type'] = Variable<String>(cropType);
    map['quantity_kg'] = Variable<double>(quantityKg);
    map['price_per_kg'] = Variable<double>(pricePerKg);
    map['gross_amount'] = Variable<double>(grossAmount);
    map['farmer_split_amount'] = Variable<double>(farmerSplitAmount);
    map['sanza_split_amount'] = Variable<double>(sanzaSplitAmount);
    map['input_deduction_amount'] = Variable<double>(inputDeductionAmount);
    map['transaction_date'] = Variable<DateTime>(transactionDate);
    {
      map['sync_status'] =
          Variable<int>($SalesTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt);
    }
    if (!nullToAbsent || lastFailureReason != null) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason);
    }
    return map;
  }

  SalesCompanion toCompanion(bool nullToAbsent) {
    return SalesCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      farmerId: farmerId == null && nullToAbsent
          ? const Value.absent()
          : Value(farmerId),
      cropType: Value(cropType),
      quantityKg: Value(quantityKg),
      pricePerKg: Value(pricePerKg),
      grossAmount: Value(grossAmount),
      farmerSplitAmount: Value(farmerSplitAmount),
      sanzaSplitAmount: Value(sanzaSplitAmount),
      inputDeductionAmount: Value(inputDeductionAmount),
      transactionDate: Value(transactionDate),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
      lastFailureReason: lastFailureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(lastFailureReason),
    );
  }

  factory Sale.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Sale(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      farmerId: serializer.fromJson<String?>(json['farmerId']),
      cropType: serializer.fromJson<String>(json['cropType']),
      quantityKg: serializer.fromJson<double>(json['quantityKg']),
      pricePerKg: serializer.fromJson<double>(json['pricePerKg']),
      grossAmount: serializer.fromJson<double>(json['grossAmount']),
      farmerSplitAmount: serializer.fromJson<double>(json['farmerSplitAmount']),
      sanzaSplitAmount: serializer.fromJson<double>(json['sanzaSplitAmount']),
      inputDeductionAmount:
          serializer.fromJson<double>(json['inputDeductionAmount']),
      transactionDate: serializer.fromJson<DateTime>(json['transactionDate']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
      serverUpdatedAt: serializer.fromJson<DateTime?>(json['serverUpdatedAt']),
      lastFailureReason:
          serializer.fromJson<String?>(json['lastFailureReason']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'farmerId': serializer.toJson<String?>(farmerId),
      'cropType': serializer.toJson<String>(cropType),
      'quantityKg': serializer.toJson<double>(quantityKg),
      'pricePerKg': serializer.toJson<double>(pricePerKg),
      'grossAmount': serializer.toJson<double>(grossAmount),
      'farmerSplitAmount': serializer.toJson<double>(farmerSplitAmount),
      'sanzaSplitAmount': serializer.toJson<double>(sanzaSplitAmount),
      'inputDeductionAmount': serializer.toJson<double>(inputDeductionAmount),
      'transactionDate': serializer.toJson<DateTime>(transactionDate),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
      'serverUpdatedAt': serializer.toJson<DateTime?>(serverUpdatedAt),
      'lastFailureReason': serializer.toJson<String?>(lastFailureReason),
    };
  }

  Sale copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          Value<String?> farmerId = const Value.absent(),
          String? cropType,
          double? quantityKg,
          double? pricePerKg,
          double? grossAmount,
          double? farmerSplitAmount,
          double? sanzaSplitAmount,
          double? inputDeductionAmount,
          DateTime? transactionDate,
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt,
          Value<DateTime?> serverUpdatedAt = const Value.absent(),
          Value<String?> lastFailureReason = const Value.absent()}) =>
      Sale(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        farmerId: farmerId.present ? farmerId.value : this.farmerId,
        cropType: cropType ?? this.cropType,
        quantityKg: quantityKg ?? this.quantityKg,
        pricePerKg: pricePerKg ?? this.pricePerKg,
        grossAmount: grossAmount ?? this.grossAmount,
        farmerSplitAmount: farmerSplitAmount ?? this.farmerSplitAmount,
        sanzaSplitAmount: sanzaSplitAmount ?? this.sanzaSplitAmount,
        inputDeductionAmount: inputDeductionAmount ?? this.inputDeductionAmount,
        transactionDate: transactionDate ?? this.transactionDate,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
        serverUpdatedAt: serverUpdatedAt.present
            ? serverUpdatedAt.value
            : this.serverUpdatedAt,
        lastFailureReason: lastFailureReason.present
            ? lastFailureReason.value
            : this.lastFailureReason,
      );
  @override
  String toString() {
    return (StringBuffer('Sale(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('cropType: $cropType, ')
          ..write('quantityKg: $quantityKg, ')
          ..write('pricePerKg: $pricePerKg, ')
          ..write('grossAmount: $grossAmount, ')
          ..write('farmerSplitAmount: $farmerSplitAmount, ')
          ..write('sanzaSplitAmount: $sanzaSplitAmount, ')
          ..write('inputDeductionAmount: $inputDeductionAmount, ')
          ..write('transactionDate: $transactionDate, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      remoteId,
      farmerId,
      cropType,
      quantityKg,
      pricePerKg,
      grossAmount,
      farmerSplitAmount,
      sanzaSplitAmount,
      inputDeductionAmount,
      transactionDate,
      syncStatus,
      localUpdatedAt,
      serverUpdatedAt,
      lastFailureReason);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Sale &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.farmerId == this.farmerId &&
          other.cropType == this.cropType &&
          other.quantityKg == this.quantityKg &&
          other.pricePerKg == this.pricePerKg &&
          other.grossAmount == this.grossAmount &&
          other.farmerSplitAmount == this.farmerSplitAmount &&
          other.sanzaSplitAmount == this.sanzaSplitAmount &&
          other.inputDeductionAmount == this.inputDeductionAmount &&
          other.transactionDate == this.transactionDate &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt &&
          other.serverUpdatedAt == this.serverUpdatedAt &&
          other.lastFailureReason == this.lastFailureReason);
}

class SalesCompanion extends UpdateCompanion<Sale> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String?> farmerId;
  final Value<String> cropType;
  final Value<double> quantityKg;
  final Value<double> pricePerKg;
  final Value<double> grossAmount;
  final Value<double> farmerSplitAmount;
  final Value<double> sanzaSplitAmount;
  final Value<double> inputDeductionAmount;
  final Value<DateTime> transactionDate;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  final Value<DateTime?> serverUpdatedAt;
  final Value<String?> lastFailureReason;
  const SalesCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.cropType = const Value.absent(),
    this.quantityKg = const Value.absent(),
    this.pricePerKg = const Value.absent(),
    this.grossAmount = const Value.absent(),
    this.farmerSplitAmount = const Value.absent(),
    this.sanzaSplitAmount = const Value.absent(),
    this.inputDeductionAmount = const Value.absent(),
    this.transactionDate = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  });
  SalesCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    required String cropType,
    required double quantityKg,
    required double pricePerKg,
    required double grossAmount,
    required double farmerSplitAmount,
    required double sanzaSplitAmount,
    this.inputDeductionAmount = const Value.absent(),
    required DateTime transactionDate,
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  })  : cropType = Value(cropType),
        quantityKg = Value(quantityKg),
        pricePerKg = Value(pricePerKg),
        grossAmount = Value(grossAmount),
        farmerSplitAmount = Value(farmerSplitAmount),
        sanzaSplitAmount = Value(sanzaSplitAmount),
        transactionDate = Value(transactionDate);
  static Insertable<Sale> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? farmerId,
    Expression<String>? cropType,
    Expression<double>? quantityKg,
    Expression<double>? pricePerKg,
    Expression<double>? grossAmount,
    Expression<double>? farmerSplitAmount,
    Expression<double>? sanzaSplitAmount,
    Expression<double>? inputDeductionAmount,
    Expression<DateTime>? transactionDate,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
    Expression<DateTime>? serverUpdatedAt,
    Expression<String>? lastFailureReason,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (cropType != null) 'crop_type': cropType,
      if (quantityKg != null) 'quantity_kg': quantityKg,
      if (pricePerKg != null) 'price_per_kg': pricePerKg,
      if (grossAmount != null) 'gross_amount': grossAmount,
      if (farmerSplitAmount != null) 'farmer_split_amount': farmerSplitAmount,
      if (sanzaSplitAmount != null) 'sanza_split_amount': sanzaSplitAmount,
      if (inputDeductionAmount != null)
        'input_deduction_amount': inputDeductionAmount,
      if (transactionDate != null) 'transaction_date': transactionDate,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (lastFailureReason != null) 'last_failure_reason': lastFailureReason,
    });
  }

  SalesCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String?>? farmerId,
      Value<String>? cropType,
      Value<double>? quantityKg,
      Value<double>? pricePerKg,
      Value<double>? grossAmount,
      Value<double>? farmerSplitAmount,
      Value<double>? sanzaSplitAmount,
      Value<double>? inputDeductionAmount,
      Value<DateTime>? transactionDate,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt,
      Value<DateTime?>? serverUpdatedAt,
      Value<String?>? lastFailureReason}) {
    return SalesCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      farmerId: farmerId ?? this.farmerId,
      cropType: cropType ?? this.cropType,
      quantityKg: quantityKg ?? this.quantityKg,
      pricePerKg: pricePerKg ?? this.pricePerKg,
      grossAmount: grossAmount ?? this.grossAmount,
      farmerSplitAmount: farmerSplitAmount ?? this.farmerSplitAmount,
      sanzaSplitAmount: sanzaSplitAmount ?? this.sanzaSplitAmount,
      inputDeductionAmount: inputDeductionAmount ?? this.inputDeductionAmount,
      transactionDate: transactionDate ?? this.transactionDate,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      lastFailureReason: lastFailureReason ?? this.lastFailureReason,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (cropType.present) {
      map['crop_type'] = Variable<String>(cropType.value);
    }
    if (quantityKg.present) {
      map['quantity_kg'] = Variable<double>(quantityKg.value);
    }
    if (pricePerKg.present) {
      map['price_per_kg'] = Variable<double>(pricePerKg.value);
    }
    if (grossAmount.present) {
      map['gross_amount'] = Variable<double>(grossAmount.value);
    }
    if (farmerSplitAmount.present) {
      map['farmer_split_amount'] = Variable<double>(farmerSplitAmount.value);
    }
    if (sanzaSplitAmount.present) {
      map['sanza_split_amount'] = Variable<double>(sanzaSplitAmount.value);
    }
    if (inputDeductionAmount.present) {
      map['input_deduction_amount'] =
          Variable<double>(inputDeductionAmount.value);
    }
    if (transactionDate.present) {
      map['transaction_date'] = Variable<DateTime>(transactionDate.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $SalesTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt.value);
    }
    if (lastFailureReason.present) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SalesCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('cropType: $cropType, ')
          ..write('quantityKg: $quantityKg, ')
          ..write('pricePerKg: $pricePerKg, ')
          ..write('grossAmount: $grossAmount, ')
          ..write('farmerSplitAmount: $farmerSplitAmount, ')
          ..write('sanzaSplitAmount: $sanzaSplitAmount, ')
          ..write('inputDeductionAmount: $inputDeductionAmount, ')
          ..write('transactionDate: $transactionDate, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }
}

class $InputInvoicesTable extends InputInvoices
    with TableInfo<$InputInvoicesTable, InputInvoice> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $InputInvoicesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _supplierMeta =
      const VerificationMeta('supplier');
  @override
  late final GeneratedColumn<String> supplier = GeneratedColumn<String>(
      'supplier', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _inputTypeMeta =
      const VerificationMeta('inputType');
  @override
  late final GeneratedColumn<String> inputType = GeneratedColumn<String>(
      'input_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _quantityMeta =
      const VerificationMeta('quantity');
  @override
  late final GeneratedColumn<double> quantity = GeneratedColumn<double>(
      'quantity', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(1.0));
  static const VerificationMeta _unitPriceMeta =
      const VerificationMeta('unitPrice');
  @override
  late final GeneratedColumn<double> unitPrice = GeneratedColumn<double>(
      'unit_price', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _totalCostMeta =
      const VerificationMeta('totalCost');
  @override
  late final GeneratedColumn<double> totalCost = GeneratedColumn<double>(
      'total_cost', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _installmentsMeta =
      const VerificationMeta('installments');
  @override
  late final GeneratedColumn<int> installments = GeneratedColumn<int>(
      'installments', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _paymentStatusMeta =
      const VerificationMeta('paymentStatus');
  @override
  late final GeneratedColumn<String> paymentStatus = GeneratedColumn<String>(
      'payment_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('pending'));
  static const VerificationMeta _purchaseDateMeta =
      const VerificationMeta('purchaseDate');
  @override
  late final GeneratedColumn<DateTime> purchaseDate = GeneratedColumn<DateTime>(
      'purchase_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($InputInvoicesTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _serverUpdatedAtMeta =
      const VerificationMeta('serverUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> serverUpdatedAt =
      GeneratedColumn<DateTime>('server_updated_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastFailureReasonMeta =
      const VerificationMeta('lastFailureReason');
  @override
  late final GeneratedColumn<String> lastFailureReason =
      GeneratedColumn<String>('last_failure_reason', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        farmerId,
        supplier,
        inputType,
        quantity,
        unitPrice,
        totalCost,
        installments,
        paymentStatus,
        purchaseDate,
        notes,
        syncStatus,
        localUpdatedAt,
        serverUpdatedAt,
        lastFailureReason
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'input_invoices';
  @override
  VerificationContext validateIntegrity(Insertable<InputInvoice> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
    }
    if (data.containsKey('supplier')) {
      context.handle(_supplierMeta,
          supplier.isAcceptableOrUnknown(data['supplier']!, _supplierMeta));
    } else if (isInserting) {
      context.missing(_supplierMeta);
    }
    if (data.containsKey('input_type')) {
      context.handle(_inputTypeMeta,
          inputType.isAcceptableOrUnknown(data['input_type']!, _inputTypeMeta));
    } else if (isInserting) {
      context.missing(_inputTypeMeta);
    }
    if (data.containsKey('quantity')) {
      context.handle(_quantityMeta,
          quantity.isAcceptableOrUnknown(data['quantity']!, _quantityMeta));
    }
    if (data.containsKey('unit_price')) {
      context.handle(_unitPriceMeta,
          unitPrice.isAcceptableOrUnknown(data['unit_price']!, _unitPriceMeta));
    } else if (isInserting) {
      context.missing(_unitPriceMeta);
    }
    if (data.containsKey('total_cost')) {
      context.handle(_totalCostMeta,
          totalCost.isAcceptableOrUnknown(data['total_cost']!, _totalCostMeta));
    } else if (isInserting) {
      context.missing(_totalCostMeta);
    }
    if (data.containsKey('installments')) {
      context.handle(
          _installmentsMeta,
          installments.isAcceptableOrUnknown(
              data['installments']!, _installmentsMeta));
    }
    if (data.containsKey('payment_status')) {
      context.handle(
          _paymentStatusMeta,
          paymentStatus.isAcceptableOrUnknown(
              data['payment_status']!, _paymentStatusMeta));
    }
    if (data.containsKey('purchase_date')) {
      context.handle(
          _purchaseDateMeta,
          purchaseDate.isAcceptableOrUnknown(
              data['purchase_date']!, _purchaseDateMeta));
    } else if (isInserting) {
      context.missing(_purchaseDateMeta);
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
          _serverUpdatedAtMeta,
          serverUpdatedAt.isAcceptableOrUnknown(
              data['server_updated_at']!, _serverUpdatedAtMeta));
    }
    if (data.containsKey('last_failure_reason')) {
      context.handle(
          _lastFailureReasonMeta,
          lastFailureReason.isAcceptableOrUnknown(
              data['last_failure_reason']!, _lastFailureReasonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  InputInvoice map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return InputInvoice(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id'])!,
      supplier: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}supplier'])!,
      inputType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}input_type'])!,
      quantity: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}quantity'])!,
      unitPrice: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}unit_price'])!,
      totalCost: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}total_cost'])!,
      installments: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}installments'])!,
      paymentStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payment_status'])!,
      purchaseDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}purchase_date'])!,
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      syncStatus: $InputInvoicesTable.$convertersyncStatus.fromSql(
          attachedDatabase.typeMapping
              .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}server_updated_at']),
      lastFailureReason: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}last_failure_reason']),
    );
  }

  @override
  $InputInvoicesTable createAlias(String alias) {
    return $InputInvoicesTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class InputInvoice extends DataClass implements Insertable<InputInvoice> {
  final int id;
  final String? remoteId;
  final String farmerId;
  final String supplier;
  final String inputType;
  final double quantity;
  final double unitPrice;
  final double totalCost;
  final int installments;
  final String paymentStatus;
  final DateTime purchaseDate;
  final String? notes;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  final DateTime? serverUpdatedAt;
  final String? lastFailureReason;
  const InputInvoice(
      {required this.id,
      this.remoteId,
      required this.farmerId,
      required this.supplier,
      required this.inputType,
      required this.quantity,
      required this.unitPrice,
      required this.totalCost,
      required this.installments,
      required this.paymentStatus,
      required this.purchaseDate,
      this.notes,
      required this.syncStatus,
      required this.localUpdatedAt,
      this.serverUpdatedAt,
      this.lastFailureReason});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['farmer_id'] = Variable<String>(farmerId);
    map['supplier'] = Variable<String>(supplier);
    map['input_type'] = Variable<String>(inputType);
    map['quantity'] = Variable<double>(quantity);
    map['unit_price'] = Variable<double>(unitPrice);
    map['total_cost'] = Variable<double>(totalCost);
    map['installments'] = Variable<int>(installments);
    map['payment_status'] = Variable<String>(paymentStatus);
    map['purchase_date'] = Variable<DateTime>(purchaseDate);
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    {
      map['sync_status'] = Variable<int>(
          $InputInvoicesTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt);
    }
    if (!nullToAbsent || lastFailureReason != null) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason);
    }
    return map;
  }

  InputInvoicesCompanion toCompanion(bool nullToAbsent) {
    return InputInvoicesCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      farmerId: Value(farmerId),
      supplier: Value(supplier),
      inputType: Value(inputType),
      quantity: Value(quantity),
      unitPrice: Value(unitPrice),
      totalCost: Value(totalCost),
      installments: Value(installments),
      paymentStatus: Value(paymentStatus),
      purchaseDate: Value(purchaseDate),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
      lastFailureReason: lastFailureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(lastFailureReason),
    );
  }

  factory InputInvoice.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return InputInvoice(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      farmerId: serializer.fromJson<String>(json['farmerId']),
      supplier: serializer.fromJson<String>(json['supplier']),
      inputType: serializer.fromJson<String>(json['inputType']),
      quantity: serializer.fromJson<double>(json['quantity']),
      unitPrice: serializer.fromJson<double>(json['unitPrice']),
      totalCost: serializer.fromJson<double>(json['totalCost']),
      installments: serializer.fromJson<int>(json['installments']),
      paymentStatus: serializer.fromJson<String>(json['paymentStatus']),
      purchaseDate: serializer.fromJson<DateTime>(json['purchaseDate']),
      notes: serializer.fromJson<String?>(json['notes']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
      serverUpdatedAt: serializer.fromJson<DateTime?>(json['serverUpdatedAt']),
      lastFailureReason:
          serializer.fromJson<String?>(json['lastFailureReason']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'farmerId': serializer.toJson<String>(farmerId),
      'supplier': serializer.toJson<String>(supplier),
      'inputType': serializer.toJson<String>(inputType),
      'quantity': serializer.toJson<double>(quantity),
      'unitPrice': serializer.toJson<double>(unitPrice),
      'totalCost': serializer.toJson<double>(totalCost),
      'installments': serializer.toJson<int>(installments),
      'paymentStatus': serializer.toJson<String>(paymentStatus),
      'purchaseDate': serializer.toJson<DateTime>(purchaseDate),
      'notes': serializer.toJson<String?>(notes),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
      'serverUpdatedAt': serializer.toJson<DateTime?>(serverUpdatedAt),
      'lastFailureReason': serializer.toJson<String?>(lastFailureReason),
    };
  }

  InputInvoice copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          String? farmerId,
          String? supplier,
          String? inputType,
          double? quantity,
          double? unitPrice,
          double? totalCost,
          int? installments,
          String? paymentStatus,
          DateTime? purchaseDate,
          Value<String?> notes = const Value.absent(),
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt,
          Value<DateTime?> serverUpdatedAt = const Value.absent(),
          Value<String?> lastFailureReason = const Value.absent()}) =>
      InputInvoice(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        farmerId: farmerId ?? this.farmerId,
        supplier: supplier ?? this.supplier,
        inputType: inputType ?? this.inputType,
        quantity: quantity ?? this.quantity,
        unitPrice: unitPrice ?? this.unitPrice,
        totalCost: totalCost ?? this.totalCost,
        installments: installments ?? this.installments,
        paymentStatus: paymentStatus ?? this.paymentStatus,
        purchaseDate: purchaseDate ?? this.purchaseDate,
        notes: notes.present ? notes.value : this.notes,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
        serverUpdatedAt: serverUpdatedAt.present
            ? serverUpdatedAt.value
            : this.serverUpdatedAt,
        lastFailureReason: lastFailureReason.present
            ? lastFailureReason.value
            : this.lastFailureReason,
      );
  @override
  String toString() {
    return (StringBuffer('InputInvoice(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('supplier: $supplier, ')
          ..write('inputType: $inputType, ')
          ..write('quantity: $quantity, ')
          ..write('unitPrice: $unitPrice, ')
          ..write('totalCost: $totalCost, ')
          ..write('installments: $installments, ')
          ..write('paymentStatus: $paymentStatus, ')
          ..write('purchaseDate: $purchaseDate, ')
          ..write('notes: $notes, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      remoteId,
      farmerId,
      supplier,
      inputType,
      quantity,
      unitPrice,
      totalCost,
      installments,
      paymentStatus,
      purchaseDate,
      notes,
      syncStatus,
      localUpdatedAt,
      serverUpdatedAt,
      lastFailureReason);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is InputInvoice &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.farmerId == this.farmerId &&
          other.supplier == this.supplier &&
          other.inputType == this.inputType &&
          other.quantity == this.quantity &&
          other.unitPrice == this.unitPrice &&
          other.totalCost == this.totalCost &&
          other.installments == this.installments &&
          other.paymentStatus == this.paymentStatus &&
          other.purchaseDate == this.purchaseDate &&
          other.notes == this.notes &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt &&
          other.serverUpdatedAt == this.serverUpdatedAt &&
          other.lastFailureReason == this.lastFailureReason);
}

class InputInvoicesCompanion extends UpdateCompanion<InputInvoice> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String> farmerId;
  final Value<String> supplier;
  final Value<String> inputType;
  final Value<double> quantity;
  final Value<double> unitPrice;
  final Value<double> totalCost;
  final Value<int> installments;
  final Value<String> paymentStatus;
  final Value<DateTime> purchaseDate;
  final Value<String?> notes;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  final Value<DateTime?> serverUpdatedAt;
  final Value<String?> lastFailureReason;
  const InputInvoicesCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.supplier = const Value.absent(),
    this.inputType = const Value.absent(),
    this.quantity = const Value.absent(),
    this.unitPrice = const Value.absent(),
    this.totalCost = const Value.absent(),
    this.installments = const Value.absent(),
    this.paymentStatus = const Value.absent(),
    this.purchaseDate = const Value.absent(),
    this.notes = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  });
  InputInvoicesCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    required String farmerId,
    required String supplier,
    required String inputType,
    this.quantity = const Value.absent(),
    required double unitPrice,
    required double totalCost,
    this.installments = const Value.absent(),
    this.paymentStatus = const Value.absent(),
    required DateTime purchaseDate,
    this.notes = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  })  : farmerId = Value(farmerId),
        supplier = Value(supplier),
        inputType = Value(inputType),
        unitPrice = Value(unitPrice),
        totalCost = Value(totalCost),
        purchaseDate = Value(purchaseDate);
  static Insertable<InputInvoice> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? farmerId,
    Expression<String>? supplier,
    Expression<String>? inputType,
    Expression<double>? quantity,
    Expression<double>? unitPrice,
    Expression<double>? totalCost,
    Expression<int>? installments,
    Expression<String>? paymentStatus,
    Expression<DateTime>? purchaseDate,
    Expression<String>? notes,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
    Expression<DateTime>? serverUpdatedAt,
    Expression<String>? lastFailureReason,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (supplier != null) 'supplier': supplier,
      if (inputType != null) 'input_type': inputType,
      if (quantity != null) 'quantity': quantity,
      if (unitPrice != null) 'unit_price': unitPrice,
      if (totalCost != null) 'total_cost': totalCost,
      if (installments != null) 'installments': installments,
      if (paymentStatus != null) 'payment_status': paymentStatus,
      if (purchaseDate != null) 'purchase_date': purchaseDate,
      if (notes != null) 'notes': notes,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (lastFailureReason != null) 'last_failure_reason': lastFailureReason,
    });
  }

  InputInvoicesCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String>? farmerId,
      Value<String>? supplier,
      Value<String>? inputType,
      Value<double>? quantity,
      Value<double>? unitPrice,
      Value<double>? totalCost,
      Value<int>? installments,
      Value<String>? paymentStatus,
      Value<DateTime>? purchaseDate,
      Value<String?>? notes,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt,
      Value<DateTime?>? serverUpdatedAt,
      Value<String?>? lastFailureReason}) {
    return InputInvoicesCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      farmerId: farmerId ?? this.farmerId,
      supplier: supplier ?? this.supplier,
      inputType: inputType ?? this.inputType,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
      totalCost: totalCost ?? this.totalCost,
      installments: installments ?? this.installments,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      purchaseDate: purchaseDate ?? this.purchaseDate,
      notes: notes ?? this.notes,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      lastFailureReason: lastFailureReason ?? this.lastFailureReason,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (supplier.present) {
      map['supplier'] = Variable<String>(supplier.value);
    }
    if (inputType.present) {
      map['input_type'] = Variable<String>(inputType.value);
    }
    if (quantity.present) {
      map['quantity'] = Variable<double>(quantity.value);
    }
    if (unitPrice.present) {
      map['unit_price'] = Variable<double>(unitPrice.value);
    }
    if (totalCost.present) {
      map['total_cost'] = Variable<double>(totalCost.value);
    }
    if (installments.present) {
      map['installments'] = Variable<int>(installments.value);
    }
    if (paymentStatus.present) {
      map['payment_status'] = Variable<String>(paymentStatus.value);
    }
    if (purchaseDate.present) {
      map['purchase_date'] = Variable<DateTime>(purchaseDate.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $InputInvoicesTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt.value);
    }
    if (lastFailureReason.present) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('InputInvoicesCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('supplier: $supplier, ')
          ..write('inputType: $inputType, ')
          ..write('quantity: $quantity, ')
          ..write('unitPrice: $unitPrice, ')
          ..write('totalCost: $totalCost, ')
          ..write('installments: $installments, ')
          ..write('paymentStatus: $paymentStatus, ')
          ..write('purchaseDate: $purchaseDate, ')
          ..write('notes: $notes, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }
}

class $VSLATransactionsTable extends VSLATransactions
    with TableInfo<$VSLATransactionsTable, VSLATransaction> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $VSLATransactionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<double> amount = GeneratedColumn<double>(
      'amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _transactionDateMeta =
      const VerificationMeta('transactionDate');
  @override
  late final GeneratedColumn<DateTime> transactionDate =
      GeneratedColumn<DateTime>('transaction_date', aliasedName, false,
          type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>(
              $VSLATransactionsTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _serverUpdatedAtMeta =
      const VerificationMeta('serverUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> serverUpdatedAt =
      GeneratedColumn<DateTime>('server_updated_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastFailureReasonMeta =
      const VerificationMeta('lastFailureReason');
  @override
  late final GeneratedColumn<String> lastFailureReason =
      GeneratedColumn<String>('last_failure_reason', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        farmerId,
        amount,
        type,
        transactionDate,
        notes,
        syncStatus,
        localUpdatedAt,
        serverUpdatedAt,
        lastFailureReason
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'v_s_l_a_transactions';
  @override
  VerificationContext validateIntegrity(Insertable<VSLATransaction> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    }
    if (data.containsKey('amount')) {
      context.handle(_amountMeta,
          amount.isAcceptableOrUnknown(data['amount']!, _amountMeta));
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('transaction_date')) {
      context.handle(
          _transactionDateMeta,
          transactionDate.isAcceptableOrUnknown(
              data['transaction_date']!, _transactionDateMeta));
    } else if (isInserting) {
      context.missing(_transactionDateMeta);
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
          _serverUpdatedAtMeta,
          serverUpdatedAt.isAcceptableOrUnknown(
              data['server_updated_at']!, _serverUpdatedAtMeta));
    }
    if (data.containsKey('last_failure_reason')) {
      context.handle(
          _lastFailureReasonMeta,
          lastFailureReason.isAcceptableOrUnknown(
              data['last_failure_reason']!, _lastFailureReasonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  VSLATransaction map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return VSLATransaction(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id']),
      amount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}amount'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      transactionDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}transaction_date'])!,
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      syncStatus: $VSLATransactionsTable.$convertersyncStatus.fromSql(
          attachedDatabase.typeMapping
              .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}server_updated_at']),
      lastFailureReason: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}last_failure_reason']),
    );
  }

  @override
  $VSLATransactionsTable createAlias(String alias) {
    return $VSLATransactionsTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class VSLATransaction extends DataClass implements Insertable<VSLATransaction> {
  final int id;
  final String? remoteId;
  final String? farmerId;
  final double amount;
  final String type;
  final DateTime transactionDate;
  final String? notes;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  final DateTime? serverUpdatedAt;
  final String? lastFailureReason;
  const VSLATransaction(
      {required this.id,
      this.remoteId,
      this.farmerId,
      required this.amount,
      required this.type,
      required this.transactionDate,
      this.notes,
      required this.syncStatus,
      required this.localUpdatedAt,
      this.serverUpdatedAt,
      this.lastFailureReason});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    if (!nullToAbsent || farmerId != null) {
      map['farmer_id'] = Variable<String>(farmerId);
    }
    map['amount'] = Variable<double>(amount);
    map['type'] = Variable<String>(type);
    map['transaction_date'] = Variable<DateTime>(transactionDate);
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    {
      map['sync_status'] = Variable<int>(
          $VSLATransactionsTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt);
    }
    if (!nullToAbsent || lastFailureReason != null) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason);
    }
    return map;
  }

  VSLATransactionsCompanion toCompanion(bool nullToAbsent) {
    return VSLATransactionsCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      farmerId: farmerId == null && nullToAbsent
          ? const Value.absent()
          : Value(farmerId),
      amount: Value(amount),
      type: Value(type),
      transactionDate: Value(transactionDate),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
      lastFailureReason: lastFailureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(lastFailureReason),
    );
  }

  factory VSLATransaction.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return VSLATransaction(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      farmerId: serializer.fromJson<String?>(json['farmerId']),
      amount: serializer.fromJson<double>(json['amount']),
      type: serializer.fromJson<String>(json['type']),
      transactionDate: serializer.fromJson<DateTime>(json['transactionDate']),
      notes: serializer.fromJson<String?>(json['notes']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
      serverUpdatedAt: serializer.fromJson<DateTime?>(json['serverUpdatedAt']),
      lastFailureReason:
          serializer.fromJson<String?>(json['lastFailureReason']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'farmerId': serializer.toJson<String?>(farmerId),
      'amount': serializer.toJson<double>(amount),
      'type': serializer.toJson<String>(type),
      'transactionDate': serializer.toJson<DateTime>(transactionDate),
      'notes': serializer.toJson<String?>(notes),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
      'serverUpdatedAt': serializer.toJson<DateTime?>(serverUpdatedAt),
      'lastFailureReason': serializer.toJson<String?>(lastFailureReason),
    };
  }

  VSLATransaction copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          Value<String?> farmerId = const Value.absent(),
          double? amount,
          String? type,
          DateTime? transactionDate,
          Value<String?> notes = const Value.absent(),
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt,
          Value<DateTime?> serverUpdatedAt = const Value.absent(),
          Value<String?> lastFailureReason = const Value.absent()}) =>
      VSLATransaction(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        farmerId: farmerId.present ? farmerId.value : this.farmerId,
        amount: amount ?? this.amount,
        type: type ?? this.type,
        transactionDate: transactionDate ?? this.transactionDate,
        notes: notes.present ? notes.value : this.notes,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
        serverUpdatedAt: serverUpdatedAt.present
            ? serverUpdatedAt.value
            : this.serverUpdatedAt,
        lastFailureReason: lastFailureReason.present
            ? lastFailureReason.value
            : this.lastFailureReason,
      );
  @override
  String toString() {
    return (StringBuffer('VSLATransaction(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('amount: $amount, ')
          ..write('type: $type, ')
          ..write('transactionDate: $transactionDate, ')
          ..write('notes: $notes, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      remoteId,
      farmerId,
      amount,
      type,
      transactionDate,
      notes,
      syncStatus,
      localUpdatedAt,
      serverUpdatedAt,
      lastFailureReason);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is VSLATransaction &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.farmerId == this.farmerId &&
          other.amount == this.amount &&
          other.type == this.type &&
          other.transactionDate == this.transactionDate &&
          other.notes == this.notes &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt &&
          other.serverUpdatedAt == this.serverUpdatedAt &&
          other.lastFailureReason == this.lastFailureReason);
}

class VSLATransactionsCompanion extends UpdateCompanion<VSLATransaction> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String?> farmerId;
  final Value<double> amount;
  final Value<String> type;
  final Value<DateTime> transactionDate;
  final Value<String?> notes;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  final Value<DateTime?> serverUpdatedAt;
  final Value<String?> lastFailureReason;
  const VSLATransactionsCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.amount = const Value.absent(),
    this.type = const Value.absent(),
    this.transactionDate = const Value.absent(),
    this.notes = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  });
  VSLATransactionsCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    required double amount,
    required String type,
    required DateTime transactionDate,
    this.notes = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  })  : amount = Value(amount),
        type = Value(type),
        transactionDate = Value(transactionDate);
  static Insertable<VSLATransaction> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? farmerId,
    Expression<double>? amount,
    Expression<String>? type,
    Expression<DateTime>? transactionDate,
    Expression<String>? notes,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
    Expression<DateTime>? serverUpdatedAt,
    Expression<String>? lastFailureReason,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (amount != null) 'amount': amount,
      if (type != null) 'type': type,
      if (transactionDate != null) 'transaction_date': transactionDate,
      if (notes != null) 'notes': notes,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (lastFailureReason != null) 'last_failure_reason': lastFailureReason,
    });
  }

  VSLATransactionsCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String?>? farmerId,
      Value<double>? amount,
      Value<String>? type,
      Value<DateTime>? transactionDate,
      Value<String?>? notes,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt,
      Value<DateTime?>? serverUpdatedAt,
      Value<String?>? lastFailureReason}) {
    return VSLATransactionsCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      farmerId: farmerId ?? this.farmerId,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      transactionDate: transactionDate ?? this.transactionDate,
      notes: notes ?? this.notes,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      lastFailureReason: lastFailureReason ?? this.lastFailureReason,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (amount.present) {
      map['amount'] = Variable<double>(amount.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (transactionDate.present) {
      map['transaction_date'] = Variable<DateTime>(transactionDate.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $VSLATransactionsTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt.value);
    }
    if (lastFailureReason.present) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VSLATransactionsCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('amount: $amount, ')
          ..write('type: $type, ')
          ..write('transactionDate: $transactionDate, ')
          ..write('notes: $notes, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }
}

class $SyncQueueTable extends SyncQueue
    with TableInfo<$SyncQueueTable, SyncQueueData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _entityTableMeta =
      const VerificationMeta('entityTable');
  @override
  late final GeneratedColumn<String> entityTable = GeneratedColumn<String>(
      'entity_table', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _actionMeta = const VerificationMeta('action');
  @override
  late final GeneratedColumn<String> action = GeneratedColumn<String>(
      'action', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _payloadMeta =
      const VerificationMeta('payload');
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
      'payload', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _localRecordIdMeta =
      const VerificationMeta('localRecordId');
  @override
  late final GeneratedColumn<int> localRecordId = GeneratedColumn<int>(
      'local_record_id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('PENDING'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _lastErrorMeta =
      const VerificationMeta('lastError');
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
      'last_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        entityTable,
        action,
        payload,
        localRecordId,
        retryCount,
        status,
        createdAt,
        lastError
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_queue';
  @override
  VerificationContext validateIntegrity(Insertable<SyncQueueData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('entity_table')) {
      context.handle(
          _entityTableMeta,
          entityTable.isAcceptableOrUnknown(
              data['entity_table']!, _entityTableMeta));
    } else if (isInserting) {
      context.missing(_entityTableMeta);
    }
    if (data.containsKey('action')) {
      context.handle(_actionMeta,
          action.isAcceptableOrUnknown(data['action']!, _actionMeta));
    } else if (isInserting) {
      context.missing(_actionMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(_payloadMeta,
          payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta));
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('local_record_id')) {
      context.handle(
          _localRecordIdMeta,
          localRecordId.isAcceptableOrUnknown(
              data['local_record_id']!, _localRecordIdMeta));
    } else if (isInserting) {
      context.missing(_localRecordIdMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('last_error')) {
      context.handle(_lastErrorMeta,
          lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SyncQueueData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncQueueData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      entityTable: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity_table'])!,
      action: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}action'])!,
      payload: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payload'])!,
      localRecordId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}local_record_id'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      lastError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_error']),
    );
  }

  @override
  $SyncQueueTable createAlias(String alias) {
    return $SyncQueueTable(attachedDatabase, alias);
  }
}

class SyncQueueData extends DataClass implements Insertable<SyncQueueData> {
  final int id;
  final String entityTable;
  final String action;
  final String payload;
  final int localRecordId;
  final int retryCount;
  final String status;
  final DateTime createdAt;
  final String? lastError;
  const SyncQueueData(
      {required this.id,
      required this.entityTable,
      required this.action,
      required this.payload,
      required this.localRecordId,
      required this.retryCount,
      required this.status,
      required this.createdAt,
      this.lastError});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['entity_table'] = Variable<String>(entityTable);
    map['action'] = Variable<String>(action);
    map['payload'] = Variable<String>(payload);
    map['local_record_id'] = Variable<int>(localRecordId);
    map['retry_count'] = Variable<int>(retryCount);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    return map;
  }

  SyncQueueCompanion toCompanion(bool nullToAbsent) {
    return SyncQueueCompanion(
      id: Value(id),
      entityTable: Value(entityTable),
      action: Value(action),
      payload: Value(payload),
      localRecordId: Value(localRecordId),
      retryCount: Value(retryCount),
      status: Value(status),
      createdAt: Value(createdAt),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
    );
  }

  factory SyncQueueData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncQueueData(
      id: serializer.fromJson<int>(json['id']),
      entityTable: serializer.fromJson<String>(json['entityTable']),
      action: serializer.fromJson<String>(json['action']),
      payload: serializer.fromJson<String>(json['payload']),
      localRecordId: serializer.fromJson<int>(json['localRecordId']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      lastError: serializer.fromJson<String?>(json['lastError']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'entityTable': serializer.toJson<String>(entityTable),
      'action': serializer.toJson<String>(action),
      'payload': serializer.toJson<String>(payload),
      'localRecordId': serializer.toJson<int>(localRecordId),
      'retryCount': serializer.toJson<int>(retryCount),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'lastError': serializer.toJson<String?>(lastError),
    };
  }

  SyncQueueData copyWith(
          {int? id,
          String? entityTable,
          String? action,
          String? payload,
          int? localRecordId,
          int? retryCount,
          String? status,
          DateTime? createdAt,
          Value<String?> lastError = const Value.absent()}) =>
      SyncQueueData(
        id: id ?? this.id,
        entityTable: entityTable ?? this.entityTable,
        action: action ?? this.action,
        payload: payload ?? this.payload,
        localRecordId: localRecordId ?? this.localRecordId,
        retryCount: retryCount ?? this.retryCount,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        lastError: lastError.present ? lastError.value : this.lastError,
      );
  @override
  String toString() {
    return (StringBuffer('SyncQueueData(')
          ..write('id: $id, ')
          ..write('entityTable: $entityTable, ')
          ..write('action: $action, ')
          ..write('payload: $payload, ')
          ..write('localRecordId: $localRecordId, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastError: $lastError')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, entityTable, action, payload,
      localRecordId, retryCount, status, createdAt, lastError);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncQueueData &&
          other.id == this.id &&
          other.entityTable == this.entityTable &&
          other.action == this.action &&
          other.payload == this.payload &&
          other.localRecordId == this.localRecordId &&
          other.retryCount == this.retryCount &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.lastError == this.lastError);
}

class SyncQueueCompanion extends UpdateCompanion<SyncQueueData> {
  final Value<int> id;
  final Value<String> entityTable;
  final Value<String> action;
  final Value<String> payload;
  final Value<int> localRecordId;
  final Value<int> retryCount;
  final Value<String> status;
  final Value<DateTime> createdAt;
  final Value<String?> lastError;
  const SyncQueueCompanion({
    this.id = const Value.absent(),
    this.entityTable = const Value.absent(),
    this.action = const Value.absent(),
    this.payload = const Value.absent(),
    this.localRecordId = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastError = const Value.absent(),
  });
  SyncQueueCompanion.insert({
    this.id = const Value.absent(),
    required String entityTable,
    required String action,
    required String payload,
    required int localRecordId,
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastError = const Value.absent(),
  })  : entityTable = Value(entityTable),
        action = Value(action),
        payload = Value(payload),
        localRecordId = Value(localRecordId);
  static Insertable<SyncQueueData> custom({
    Expression<int>? id,
    Expression<String>? entityTable,
    Expression<String>? action,
    Expression<String>? payload,
    Expression<int>? localRecordId,
    Expression<int>? retryCount,
    Expression<String>? status,
    Expression<DateTime>? createdAt,
    Expression<String>? lastError,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (entityTable != null) 'entity_table': entityTable,
      if (action != null) 'action': action,
      if (payload != null) 'payload': payload,
      if (localRecordId != null) 'local_record_id': localRecordId,
      if (retryCount != null) 'retry_count': retryCount,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (lastError != null) 'last_error': lastError,
    });
  }

  SyncQueueCompanion copyWith(
      {Value<int>? id,
      Value<String>? entityTable,
      Value<String>? action,
      Value<String>? payload,
      Value<int>? localRecordId,
      Value<int>? retryCount,
      Value<String>? status,
      Value<DateTime>? createdAt,
      Value<String?>? lastError}) {
    return SyncQueueCompanion(
      id: id ?? this.id,
      entityTable: entityTable ?? this.entityTable,
      action: action ?? this.action,
      payload: payload ?? this.payload,
      localRecordId: localRecordId ?? this.localRecordId,
      retryCount: retryCount ?? this.retryCount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      lastError: lastError ?? this.lastError,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (entityTable.present) {
      map['entity_table'] = Variable<String>(entityTable.value);
    }
    if (action.present) {
      map['action'] = Variable<String>(action.value);
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (localRecordId.present) {
      map['local_record_id'] = Variable<int>(localRecordId.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueCompanion(')
          ..write('id: $id, ')
          ..write('entityTable: $entityTable, ')
          ..write('action: $action, ')
          ..write('payload: $payload, ')
          ..write('localRecordId: $localRecordId, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastError: $lastError')
          ..write(')'))
        .toString();
  }
}

class $TrainingsTable extends Trainings
    with TableInfo<$TrainingsTable, Training> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TrainingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _topicMeta = const VerificationMeta('topic');
  @override
  late final GeneratedColumn<String> topic = GeneratedColumn<String>(
      'topic', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<DateTime> date = GeneratedColumn<DateTime>(
      'date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _locationMeta =
      const VerificationMeta('location');
  @override
  late final GeneratedColumn<String> location = GeneratedColumn<String>(
      'location', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($TrainingsTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, remoteId, topic, date, location, syncStatus, localUpdatedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'trainings';
  @override
  VerificationContext validateIntegrity(Insertable<Training> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('topic')) {
      context.handle(
          _topicMeta, topic.isAcceptableOrUnknown(data['topic']!, _topicMeta));
    } else if (isInserting) {
      context.missing(_topicMeta);
    }
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    } else if (isInserting) {
      context.missing(_dateMeta);
    }
    if (data.containsKey('location')) {
      context.handle(_locationMeta,
          location.isAcceptableOrUnknown(data['location']!, _locationMeta));
    } else if (isInserting) {
      context.missing(_locationMeta);
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Training map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Training(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      topic: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}topic'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}date'])!,
      location: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}location'])!,
      syncStatus: $TrainingsTable.$convertersyncStatus.fromSql(attachedDatabase
          .typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
    );
  }

  @override
  $TrainingsTable createAlias(String alias) {
    return $TrainingsTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class Training extends DataClass implements Insertable<Training> {
  final int id;
  final String? remoteId;
  final String topic;
  final DateTime date;
  final String location;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  const Training(
      {required this.id,
      this.remoteId,
      required this.topic,
      required this.date,
      required this.location,
      required this.syncStatus,
      required this.localUpdatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['topic'] = Variable<String>(topic);
    map['date'] = Variable<DateTime>(date);
    map['location'] = Variable<String>(location);
    {
      map['sync_status'] =
          Variable<int>($TrainingsTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    return map;
  }

  TrainingsCompanion toCompanion(bool nullToAbsent) {
    return TrainingsCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      topic: Value(topic),
      date: Value(date),
      location: Value(location),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
    );
  }

  factory Training.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Training(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      topic: serializer.fromJson<String>(json['topic']),
      date: serializer.fromJson<DateTime>(json['date']),
      location: serializer.fromJson<String>(json['location']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'topic': serializer.toJson<String>(topic),
      'date': serializer.toJson<DateTime>(date),
      'location': serializer.toJson<String>(location),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
    };
  }

  Training copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          String? topic,
          DateTime? date,
          String? location,
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt}) =>
      Training(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        topic: topic ?? this.topic,
        date: date ?? this.date,
        location: location ?? this.location,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      );
  @override
  String toString() {
    return (StringBuffer('Training(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('topic: $topic, ')
          ..write('date: $date, ')
          ..write('location: $location, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, remoteId, topic, date, location, syncStatus, localUpdatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Training &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.topic == this.topic &&
          other.date == this.date &&
          other.location == this.location &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt);
}

class TrainingsCompanion extends UpdateCompanion<Training> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String> topic;
  final Value<DateTime> date;
  final Value<String> location;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  const TrainingsCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.topic = const Value.absent(),
    this.date = const Value.absent(),
    this.location = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
  });
  TrainingsCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    required String topic,
    required DateTime date,
    required String location,
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
  })  : topic = Value(topic),
        date = Value(date),
        location = Value(location);
  static Insertable<Training> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? topic,
    Expression<DateTime>? date,
    Expression<String>? location,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (topic != null) 'topic': topic,
      if (date != null) 'date': date,
      if (location != null) 'location': location,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
    });
  }

  TrainingsCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String>? topic,
      Value<DateTime>? date,
      Value<String>? location,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt}) {
    return TrainingsCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      topic: topic ?? this.topic,
      date: date ?? this.date,
      location: location ?? this.location,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (topic.present) {
      map['topic'] = Variable<String>(topic.value);
    }
    if (date.present) {
      map['date'] = Variable<DateTime>(date.value);
    }
    if (location.present) {
      map['location'] = Variable<String>(location.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $TrainingsTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TrainingsCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('topic: $topic, ')
          ..write('date: $date, ')
          ..write('location: $location, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt')
          ..write(')'))
        .toString();
  }
}

class $AttendanceTable extends Attendance
    with TableInfo<$AttendanceTable, AttendanceData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AttendanceTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _trainingIdsMeta =
      const VerificationMeta('trainingIds');
  @override
  late final GeneratedColumn<String> trainingIds = GeneratedColumn<String>(
      'training_ids', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('TRAINING'));
  static const VerificationMeta _relatedIdMeta =
      const VerificationMeta('relatedId');
  @override
  late final GeneratedColumn<String> relatedId = GeneratedColumn<String>(
      'related_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _timestampMeta =
      const VerificationMeta('timestamp');
  @override
  late final GeneratedColumn<DateTime> timestamp = GeneratedColumn<DateTime>(
      'timestamp', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($AttendanceTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        trainingIds,
        farmerId,
        type,
        relatedId,
        timestamp,
        syncStatus,
        localUpdatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'attendance';
  @override
  VerificationContext validateIntegrity(Insertable<AttendanceData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('training_ids')) {
      context.handle(
          _trainingIdsMeta,
          trainingIds.isAcceptableOrUnknown(
              data['training_ids']!, _trainingIdsMeta));
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    }
    if (data.containsKey('related_id')) {
      context.handle(_relatedIdMeta,
          relatedId.isAcceptableOrUnknown(data['related_id']!, _relatedIdMeta));
    }
    if (data.containsKey('timestamp')) {
      context.handle(_timestampMeta,
          timestamp.isAcceptableOrUnknown(data['timestamp']!, _timestampMeta));
    } else if (isInserting) {
      context.missing(_timestampMeta);
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AttendanceData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AttendanceData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      trainingIds: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}training_ids']),
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id']),
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      relatedId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}related_id']),
      timestamp: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}timestamp'])!,
      syncStatus: $AttendanceTable.$convertersyncStatus.fromSql(attachedDatabase
          .typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
    );
  }

  @override
  $AttendanceTable createAlias(String alias) {
    return $AttendanceTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class AttendanceData extends DataClass implements Insertable<AttendanceData> {
  final int id;
  final String? remoteId;
  final String? trainingIds;
  final String? farmerId;
  final String type;
  final String? relatedId;
  final DateTime timestamp;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  const AttendanceData(
      {required this.id,
      this.remoteId,
      this.trainingIds,
      this.farmerId,
      required this.type,
      this.relatedId,
      required this.timestamp,
      required this.syncStatus,
      required this.localUpdatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    if (!nullToAbsent || trainingIds != null) {
      map['training_ids'] = Variable<String>(trainingIds);
    }
    if (!nullToAbsent || farmerId != null) {
      map['farmer_id'] = Variable<String>(farmerId);
    }
    map['type'] = Variable<String>(type);
    if (!nullToAbsent || relatedId != null) {
      map['related_id'] = Variable<String>(relatedId);
    }
    map['timestamp'] = Variable<DateTime>(timestamp);
    {
      map['sync_status'] = Variable<int>(
          $AttendanceTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    return map;
  }

  AttendanceCompanion toCompanion(bool nullToAbsent) {
    return AttendanceCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      trainingIds: trainingIds == null && nullToAbsent
          ? const Value.absent()
          : Value(trainingIds),
      farmerId: farmerId == null && nullToAbsent
          ? const Value.absent()
          : Value(farmerId),
      type: Value(type),
      relatedId: relatedId == null && nullToAbsent
          ? const Value.absent()
          : Value(relatedId),
      timestamp: Value(timestamp),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
    );
  }

  factory AttendanceData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AttendanceData(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      trainingIds: serializer.fromJson<String?>(json['trainingIds']),
      farmerId: serializer.fromJson<String?>(json['farmerId']),
      type: serializer.fromJson<String>(json['type']),
      relatedId: serializer.fromJson<String?>(json['relatedId']),
      timestamp: serializer.fromJson<DateTime>(json['timestamp']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'trainingIds': serializer.toJson<String?>(trainingIds),
      'farmerId': serializer.toJson<String?>(farmerId),
      'type': serializer.toJson<String>(type),
      'relatedId': serializer.toJson<String?>(relatedId),
      'timestamp': serializer.toJson<DateTime>(timestamp),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
    };
  }

  AttendanceData copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          Value<String?> trainingIds = const Value.absent(),
          Value<String?> farmerId = const Value.absent(),
          String? type,
          Value<String?> relatedId = const Value.absent(),
          DateTime? timestamp,
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt}) =>
      AttendanceData(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        trainingIds: trainingIds.present ? trainingIds.value : this.trainingIds,
        farmerId: farmerId.present ? farmerId.value : this.farmerId,
        type: type ?? this.type,
        relatedId: relatedId.present ? relatedId.value : this.relatedId,
        timestamp: timestamp ?? this.timestamp,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      );
  @override
  String toString() {
    return (StringBuffer('AttendanceData(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('trainingIds: $trainingIds, ')
          ..write('farmerId: $farmerId, ')
          ..write('type: $type, ')
          ..write('relatedId: $relatedId, ')
          ..write('timestamp: $timestamp, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, remoteId, trainingIds, farmerId, type,
      relatedId, timestamp, syncStatus, localUpdatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AttendanceData &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.trainingIds == this.trainingIds &&
          other.farmerId == this.farmerId &&
          other.type == this.type &&
          other.relatedId == this.relatedId &&
          other.timestamp == this.timestamp &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt);
}

class AttendanceCompanion extends UpdateCompanion<AttendanceData> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String?> trainingIds;
  final Value<String?> farmerId;
  final Value<String> type;
  final Value<String?> relatedId;
  final Value<DateTime> timestamp;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  const AttendanceCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.trainingIds = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.type = const Value.absent(),
    this.relatedId = const Value.absent(),
    this.timestamp = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
  });
  AttendanceCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.trainingIds = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.type = const Value.absent(),
    this.relatedId = const Value.absent(),
    required DateTime timestamp,
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
  }) : timestamp = Value(timestamp);
  static Insertable<AttendanceData> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? trainingIds,
    Expression<String>? farmerId,
    Expression<String>? type,
    Expression<String>? relatedId,
    Expression<DateTime>? timestamp,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (trainingIds != null) 'training_ids': trainingIds,
      if (farmerId != null) 'farmer_id': farmerId,
      if (type != null) 'type': type,
      if (relatedId != null) 'related_id': relatedId,
      if (timestamp != null) 'timestamp': timestamp,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
    });
  }

  AttendanceCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String?>? trainingIds,
      Value<String?>? farmerId,
      Value<String>? type,
      Value<String?>? relatedId,
      Value<DateTime>? timestamp,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt}) {
    return AttendanceCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      trainingIds: trainingIds ?? this.trainingIds,
      farmerId: farmerId ?? this.farmerId,
      type: type ?? this.type,
      relatedId: relatedId ?? this.relatedId,
      timestamp: timestamp ?? this.timestamp,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (trainingIds.present) {
      map['training_ids'] = Variable<String>(trainingIds.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (relatedId.present) {
      map['related_id'] = Variable<String>(relatedId.value);
    }
    if (timestamp.present) {
      map['timestamp'] = Variable<DateTime>(timestamp.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $AttendanceTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AttendanceCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('trainingIds: $trainingIds, ')
          ..write('farmerId: $farmerId, ')
          ..write('type: $type, ')
          ..write('relatedId: $relatedId, ')
          ..write('timestamp: $timestamp, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt')
          ..write(')'))
        .toString();
  }
}

class $PlotBoundariesTable extends PlotBoundaries
    with TableInfo<$PlotBoundariesTable, PlotBoundary> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PlotBoundariesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<String> farmerId = GeneratedColumn<String>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _orderIndexMeta =
      const VerificationMeta('orderIndex');
  @override
  late final GeneratedColumn<int> orderIndex = GeneratedColumn<int>(
      'order_index', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumnWithTypeConverter<SyncStatus, int> syncStatus =
      GeneratedColumn<int>('sync_status', aliasedName, false,
              type: DriftSqlType.int,
              requiredDuringInsert: false,
              defaultValue: const Constant(1))
          .withConverter<SyncStatus>($PlotBoundariesTable.$convertersyncStatus);
  static const VerificationMeta _localUpdatedAtMeta =
      const VerificationMeta('localUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> localUpdatedAt =
      GeneratedColumn<DateTime>('local_updated_at', aliasedName, false,
          type: DriftSqlType.dateTime,
          requiredDuringInsert: false,
          defaultValue: currentDateAndTime);
  static const VerificationMeta _serverUpdatedAtMeta =
      const VerificationMeta('serverUpdatedAt');
  @override
  late final GeneratedColumn<DateTime> serverUpdatedAt =
      GeneratedColumn<DateTime>('server_updated_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastFailureReasonMeta =
      const VerificationMeta('lastFailureReason');
  @override
  late final GeneratedColumn<String> lastFailureReason =
      GeneratedColumn<String>('last_failure_reason', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        remoteId,
        farmerId,
        latitude,
        longitude,
        orderIndex,
        syncStatus,
        localUpdatedAt,
        serverUpdatedAt,
        lastFailureReason
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'plot_boundaries';
  @override
  VerificationContext validateIntegrity(Insertable<PlotBoundary> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('order_index')) {
      context.handle(
          _orderIndexMeta,
          orderIndex.isAcceptableOrUnknown(
              data['order_index']!, _orderIndexMeta));
    } else if (isInserting) {
      context.missing(_orderIndexMeta);
    }
    context.handle(_syncStatusMeta, const VerificationResult.success());
    if (data.containsKey('local_updated_at')) {
      context.handle(
          _localUpdatedAtMeta,
          localUpdatedAt.isAcceptableOrUnknown(
              data['local_updated_at']!, _localUpdatedAtMeta));
    }
    if (data.containsKey('server_updated_at')) {
      context.handle(
          _serverUpdatedAtMeta,
          serverUpdatedAt.isAcceptableOrUnknown(
              data['server_updated_at']!, _serverUpdatedAtMeta));
    }
    if (data.containsKey('last_failure_reason')) {
      context.handle(
          _lastFailureReasonMeta,
          lastFailureReason.isAcceptableOrUnknown(
              data['last_failure_reason']!, _lastFailureReasonMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  PlotBoundary map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return PlotBoundary(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}farmer_id'])!,
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude'])!,
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude'])!,
      orderIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}order_index'])!,
      syncStatus: $PlotBoundariesTable.$convertersyncStatus.fromSql(
          attachedDatabase.typeMapping
              .read(DriftSqlType.int, data['${effectivePrefix}sync_status'])!),
      localUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}local_updated_at'])!,
      serverUpdatedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}server_updated_at']),
      lastFailureReason: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}last_failure_reason']),
    );
  }

  @override
  $PlotBoundariesTable createAlias(String alias) {
    return $PlotBoundariesTable(attachedDatabase, alias);
  }

  static TypeConverter<SyncStatus, int> $convertersyncStatus =
      const SyncStatusConverter();
}

class PlotBoundary extends DataClass implements Insertable<PlotBoundary> {
  final int id;
  final String? remoteId;
  final String farmerId;
  final double latitude;
  final double longitude;
  final int orderIndex;
  final SyncStatus syncStatus;
  final DateTime localUpdatedAt;
  final DateTime? serverUpdatedAt;
  final String? lastFailureReason;
  const PlotBoundary(
      {required this.id,
      this.remoteId,
      required this.farmerId,
      required this.latitude,
      required this.longitude,
      required this.orderIndex,
      required this.syncStatus,
      required this.localUpdatedAt,
      this.serverUpdatedAt,
      this.lastFailureReason});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['farmer_id'] = Variable<String>(farmerId);
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    map['order_index'] = Variable<int>(orderIndex);
    {
      map['sync_status'] = Variable<int>(
          $PlotBoundariesTable.$convertersyncStatus.toSql(syncStatus));
    }
    map['local_updated_at'] = Variable<DateTime>(localUpdatedAt);
    if (!nullToAbsent || serverUpdatedAt != null) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt);
    }
    if (!nullToAbsent || lastFailureReason != null) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason);
    }
    return map;
  }

  PlotBoundariesCompanion toCompanion(bool nullToAbsent) {
    return PlotBoundariesCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      farmerId: Value(farmerId),
      latitude: Value(latitude),
      longitude: Value(longitude),
      orderIndex: Value(orderIndex),
      syncStatus: Value(syncStatus),
      localUpdatedAt: Value(localUpdatedAt),
      serverUpdatedAt: serverUpdatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(serverUpdatedAt),
      lastFailureReason: lastFailureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(lastFailureReason),
    );
  }

  factory PlotBoundary.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return PlotBoundary(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      farmerId: serializer.fromJson<String>(json['farmerId']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      orderIndex: serializer.fromJson<int>(json['orderIndex']),
      syncStatus: serializer.fromJson<SyncStatus>(json['syncStatus']),
      localUpdatedAt: serializer.fromJson<DateTime>(json['localUpdatedAt']),
      serverUpdatedAt: serializer.fromJson<DateTime?>(json['serverUpdatedAt']),
      lastFailureReason:
          serializer.fromJson<String?>(json['lastFailureReason']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'farmerId': serializer.toJson<String>(farmerId),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'orderIndex': serializer.toJson<int>(orderIndex),
      'syncStatus': serializer.toJson<SyncStatus>(syncStatus),
      'localUpdatedAt': serializer.toJson<DateTime>(localUpdatedAt),
      'serverUpdatedAt': serializer.toJson<DateTime?>(serverUpdatedAt),
      'lastFailureReason': serializer.toJson<String?>(lastFailureReason),
    };
  }

  PlotBoundary copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          String? farmerId,
          double? latitude,
          double? longitude,
          int? orderIndex,
          SyncStatus? syncStatus,
          DateTime? localUpdatedAt,
          Value<DateTime?> serverUpdatedAt = const Value.absent(),
          Value<String?> lastFailureReason = const Value.absent()}) =>
      PlotBoundary(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        farmerId: farmerId ?? this.farmerId,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        orderIndex: orderIndex ?? this.orderIndex,
        syncStatus: syncStatus ?? this.syncStatus,
        localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
        serverUpdatedAt: serverUpdatedAt.present
            ? serverUpdatedAt.value
            : this.serverUpdatedAt,
        lastFailureReason: lastFailureReason.present
            ? lastFailureReason.value
            : this.lastFailureReason,
      );
  @override
  String toString() {
    return (StringBuffer('PlotBoundary(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      remoteId,
      farmerId,
      latitude,
      longitude,
      orderIndex,
      syncStatus,
      localUpdatedAt,
      serverUpdatedAt,
      lastFailureReason);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is PlotBoundary &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.farmerId == this.farmerId &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.orderIndex == this.orderIndex &&
          other.syncStatus == this.syncStatus &&
          other.localUpdatedAt == this.localUpdatedAt &&
          other.serverUpdatedAt == this.serverUpdatedAt &&
          other.lastFailureReason == this.lastFailureReason);
}

class PlotBoundariesCompanion extends UpdateCompanion<PlotBoundary> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String> farmerId;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<int> orderIndex;
  final Value<SyncStatus> syncStatus;
  final Value<DateTime> localUpdatedAt;
  final Value<DateTime?> serverUpdatedAt;
  final Value<String?> lastFailureReason;
  const PlotBoundariesCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.orderIndex = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  });
  PlotBoundariesCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    required String farmerId,
    required double latitude,
    required double longitude,
    required int orderIndex,
    this.syncStatus = const Value.absent(),
    this.localUpdatedAt = const Value.absent(),
    this.serverUpdatedAt = const Value.absent(),
    this.lastFailureReason = const Value.absent(),
  })  : farmerId = Value(farmerId),
        latitude = Value(latitude),
        longitude = Value(longitude),
        orderIndex = Value(orderIndex);
  static Insertable<PlotBoundary> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? farmerId,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<int>? orderIndex,
    Expression<int>? syncStatus,
    Expression<DateTime>? localUpdatedAt,
    Expression<DateTime>? serverUpdatedAt,
    Expression<String>? lastFailureReason,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (orderIndex != null) 'order_index': orderIndex,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (localUpdatedAt != null) 'local_updated_at': localUpdatedAt,
      if (serverUpdatedAt != null) 'server_updated_at': serverUpdatedAt,
      if (lastFailureReason != null) 'last_failure_reason': lastFailureReason,
    });
  }

  PlotBoundariesCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String>? farmerId,
      Value<double>? latitude,
      Value<double>? longitude,
      Value<int>? orderIndex,
      Value<SyncStatus>? syncStatus,
      Value<DateTime>? localUpdatedAt,
      Value<DateTime?>? serverUpdatedAt,
      Value<String?>? lastFailureReason}) {
    return PlotBoundariesCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      farmerId: farmerId ?? this.farmerId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      orderIndex: orderIndex ?? this.orderIndex,
      syncStatus: syncStatus ?? this.syncStatus,
      localUpdatedAt: localUpdatedAt ?? this.localUpdatedAt,
      serverUpdatedAt: serverUpdatedAt ?? this.serverUpdatedAt,
      lastFailureReason: lastFailureReason ?? this.lastFailureReason,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<String>(farmerId.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (orderIndex.present) {
      map['order_index'] = Variable<int>(orderIndex.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<int>(
          $PlotBoundariesTable.$convertersyncStatus.toSql(syncStatus.value));
    }
    if (localUpdatedAt.present) {
      map['local_updated_at'] = Variable<DateTime>(localUpdatedAt.value);
    }
    if (serverUpdatedAt.present) {
      map['server_updated_at'] = Variable<DateTime>(serverUpdatedAt.value);
    }
    if (lastFailureReason.present) {
      map['last_failure_reason'] = Variable<String>(lastFailureReason.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PlotBoundariesCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('farmerId: $farmerId, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('localUpdatedAt: $localUpdatedAt, ')
          ..write('serverUpdatedAt: $serverUpdatedAt, ')
          ..write('lastFailureReason: $lastFailureReason')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  late final $FarmersTable farmers = $FarmersTable(this);
  late final $SalesTable sales = $SalesTable(this);
  late final $InputInvoicesTable inputInvoices = $InputInvoicesTable(this);
  late final $VSLATransactionsTable vSLATransactions =
      $VSLATransactionsTable(this);
  late final $SyncQueueTable syncQueue = $SyncQueueTable(this);
  late final $TrainingsTable trainings = $TrainingsTable(this);
  late final $AttendanceTable attendance = $AttendanceTable(this);
  late final $PlotBoundariesTable plotBoundaries = $PlotBoundariesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        farmers,
        sales,
        inputInvoices,
        vSLATransactions,
        syncQueue,
        trainings,
        attendance,
        plotBoundaries
      ];
}
