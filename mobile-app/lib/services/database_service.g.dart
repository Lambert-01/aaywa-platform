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
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _fullNameMeta =
      const VerificationMeta('fullName');
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
      'full_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nationalIdMeta =
      const VerificationMeta('nationalId');
  @override
  late final GeneratedColumn<String> nationalId = GeneratedColumn<String>(
      'national_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _landSizeHaMeta =
      const VerificationMeta('landSizeHa');
  @override
  late final GeneratedColumn<double> landSizeHa = GeneratedColumn<double>(
      'land_size_ha', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _locationStrMeta =
      const VerificationMeta('locationStr');
  @override
  late final GeneratedColumn<String> locationStr = GeneratedColumn<String>(
      'location_str', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns =>
      [id, remoteId, fullName, nationalId, landSizeHa, locationStr, isSynced];
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
    if (data.containsKey('full_name')) {
      context.handle(_fullNameMeta,
          fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta));
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    if (data.containsKey('national_id')) {
      context.handle(
          _nationalIdMeta,
          nationalId.isAcceptableOrUnknown(
              data['national_id']!, _nationalIdMeta));
    } else if (isInserting) {
      context.missing(_nationalIdMeta);
    }
    if (data.containsKey('land_size_ha')) {
      context.handle(
          _landSizeHaMeta,
          landSizeHa.isAcceptableOrUnknown(
              data['land_size_ha']!, _landSizeHaMeta));
    } else if (isInserting) {
      context.missing(_landSizeHaMeta);
    }
    if (data.containsKey('location_str')) {
      context.handle(
          _locationStrMeta,
          locationStr.isAcceptableOrUnknown(
              data['location_str']!, _locationStrMeta));
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
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
      fullName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}full_name'])!,
      nationalId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}national_id'])!,
      landSizeHa: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}land_size_ha'])!,
      locationStr: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}location_str']),
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
    );
  }

  @override
  $FarmersTable createAlias(String alias) {
    return $FarmersTable(attachedDatabase, alias);
  }
}

class Farmer extends DataClass implements Insertable<Farmer> {
  final int id;
  final String? remoteId;
  final String fullName;
  final String nationalId;
  final double landSizeHa;
  final String? locationStr;
  final bool isSynced;
  const Farmer(
      {required this.id,
      this.remoteId,
      required this.fullName,
      required this.nationalId,
      required this.landSizeHa,
      this.locationStr,
      required this.isSynced});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['full_name'] = Variable<String>(fullName);
    map['national_id'] = Variable<String>(nationalId);
    map['land_size_ha'] = Variable<double>(landSizeHa);
    if (!nullToAbsent || locationStr != null) {
      map['location_str'] = Variable<String>(locationStr);
    }
    map['is_synced'] = Variable<bool>(isSynced);
    return map;
  }

  FarmersCompanion toCompanion(bool nullToAbsent) {
    return FarmersCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      fullName: Value(fullName),
      nationalId: Value(nationalId),
      landSizeHa: Value(landSizeHa),
      locationStr: locationStr == null && nullToAbsent
          ? const Value.absent()
          : Value(locationStr),
      isSynced: Value(isSynced),
    );
  }

  factory Farmer.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Farmer(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      fullName: serializer.fromJson<String>(json['fullName']),
      nationalId: serializer.fromJson<String>(json['nationalId']),
      landSizeHa: serializer.fromJson<double>(json['landSizeHa']),
      locationStr: serializer.fromJson<String?>(json['locationStr']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'fullName': serializer.toJson<String>(fullName),
      'nationalId': serializer.toJson<String>(nationalId),
      'landSizeHa': serializer.toJson<double>(landSizeHa),
      'locationStr': serializer.toJson<String?>(locationStr),
      'isSynced': serializer.toJson<bool>(isSynced),
    };
  }

  Farmer copyWith(
          {int? id,
          Value<String?> remoteId = const Value.absent(),
          String? fullName,
          String? nationalId,
          double? landSizeHa,
          Value<String?> locationStr = const Value.absent(),
          bool? isSynced}) =>
      Farmer(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        fullName: fullName ?? this.fullName,
        nationalId: nationalId ?? this.nationalId,
        landSizeHa: landSizeHa ?? this.landSizeHa,
        locationStr: locationStr.present ? locationStr.value : this.locationStr,
        isSynced: isSynced ?? this.isSynced,
      );
  Farmer copyWithCompanion(FarmersCompanion data) {
    return Farmer(
      id: data.id.present ? data.id.value : this.id,
      remoteId: data.remoteId.present ? data.remoteId.value : this.remoteId,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
      nationalId:
          data.nationalId.present ? data.nationalId.value : this.nationalId,
      landSizeHa:
          data.landSizeHa.present ? data.landSizeHa.value : this.landSizeHa,
      locationStr:
          data.locationStr.present ? data.locationStr.value : this.locationStr,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Farmer(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('fullName: $fullName, ')
          ..write('nationalId: $nationalId, ')
          ..write('landSizeHa: $landSizeHa, ')
          ..write('locationStr: $locationStr, ')
          ..write('isSynced: $isSynced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, remoteId, fullName, nationalId, landSizeHa, locationStr, isSynced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Farmer &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.fullName == this.fullName &&
          other.nationalId == this.nationalId &&
          other.landSizeHa == this.landSizeHa &&
          other.locationStr == this.locationStr &&
          other.isSynced == this.isSynced);
}

class FarmersCompanion extends UpdateCompanion<Farmer> {
  final Value<int> id;
  final Value<String?> remoteId;
  final Value<String> fullName;
  final Value<String> nationalId;
  final Value<double> landSizeHa;
  final Value<String?> locationStr;
  final Value<bool> isSynced;
  const FarmersCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.fullName = const Value.absent(),
    this.nationalId = const Value.absent(),
    this.landSizeHa = const Value.absent(),
    this.locationStr = const Value.absent(),
    this.isSynced = const Value.absent(),
  });
  FarmersCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    required String fullName,
    required String nationalId,
    required double landSizeHa,
    this.locationStr = const Value.absent(),
    this.isSynced = const Value.absent(),
  })  : fullName = Value(fullName),
        nationalId = Value(nationalId),
        landSizeHa = Value(landSizeHa);
  static Insertable<Farmer> custom({
    Expression<int>? id,
    Expression<String>? remoteId,
    Expression<String>? fullName,
    Expression<String>? nationalId,
    Expression<double>? landSizeHa,
    Expression<String>? locationStr,
    Expression<bool>? isSynced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (fullName != null) 'full_name': fullName,
      if (nationalId != null) 'national_id': nationalId,
      if (landSizeHa != null) 'land_size_ha': landSizeHa,
      if (locationStr != null) 'location_str': locationStr,
      if (isSynced != null) 'is_synced': isSynced,
    });
  }

  FarmersCompanion copyWith(
      {Value<int>? id,
      Value<String?>? remoteId,
      Value<String>? fullName,
      Value<String>? nationalId,
      Value<double>? landSizeHa,
      Value<String?>? locationStr,
      Value<bool>? isSynced}) {
    return FarmersCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      fullName: fullName ?? this.fullName,
      nationalId: nationalId ?? this.nationalId,
      landSizeHa: landSizeHa ?? this.landSizeHa,
      locationStr: locationStr ?? this.locationStr,
      isSynced: isSynced ?? this.isSynced,
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
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (nationalId.present) {
      map['national_id'] = Variable<String>(nationalId.value);
    }
    if (landSizeHa.present) {
      map['land_size_ha'] = Variable<double>(landSizeHa.value);
    }
    if (locationStr.present) {
      map['location_str'] = Variable<String>(locationStr.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('FarmersCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('fullName: $fullName, ')
          ..write('nationalId: $nationalId, ')
          ..write('landSizeHa: $landSizeHa, ')
          ..write('locationStr: $locationStr, ')
          ..write('isSynced: $isSynced')
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
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<int> farmerId = GeneratedColumn<int>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES farmers (id)'));
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
  static const VerificationMeta _totalAmountMeta =
      const VerificationMeta('totalAmount');
  @override
  late final GeneratedColumn<double> totalAmount = GeneratedColumn<double>(
      'total_amount', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<String> date = GeneratedColumn<String>(
      'date', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        farmerId,
        cropType,
        quantityKg,
        pricePerKg,
        totalAmount,
        date,
        isSynced
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
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
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
    if (data.containsKey('total_amount')) {
      context.handle(
          _totalAmountMeta,
          totalAmount.isAcceptableOrUnknown(
              data['total_amount']!, _totalAmountMeta));
    } else if (isInserting) {
      context.missing(_totalAmountMeta);
    }
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    } else if (isInserting) {
      context.missing(_dateMeta);
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
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
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}farmer_id'])!,
      cropType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}crop_type'])!,
      quantityKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}quantity_kg'])!,
      pricePerKg: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}price_per_kg'])!,
      totalAmount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}total_amount'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}date'])!,
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
    );
  }

  @override
  $SalesTable createAlias(String alias) {
    return $SalesTable(attachedDatabase, alias);
  }
}

class Sale extends DataClass implements Insertable<Sale> {
  final int id;
  final int farmerId;
  final String cropType;
  final double quantityKg;
  final double pricePerKg;
  final double totalAmount;
  final String date;
  final bool isSynced;
  const Sale(
      {required this.id,
      required this.farmerId,
      required this.cropType,
      required this.quantityKg,
      required this.pricePerKg,
      required this.totalAmount,
      required this.date,
      required this.isSynced});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['farmer_id'] = Variable<int>(farmerId);
    map['crop_type'] = Variable<String>(cropType);
    map['quantity_kg'] = Variable<double>(quantityKg);
    map['price_per_kg'] = Variable<double>(pricePerKg);
    map['total_amount'] = Variable<double>(totalAmount);
    map['date'] = Variable<String>(date);
    map['is_synced'] = Variable<bool>(isSynced);
    return map;
  }

  SalesCompanion toCompanion(bool nullToAbsent) {
    return SalesCompanion(
      id: Value(id),
      farmerId: Value(farmerId),
      cropType: Value(cropType),
      quantityKg: Value(quantityKg),
      pricePerKg: Value(pricePerKg),
      totalAmount: Value(totalAmount),
      date: Value(date),
      isSynced: Value(isSynced),
    );
  }

  factory Sale.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Sale(
      id: serializer.fromJson<int>(json['id']),
      farmerId: serializer.fromJson<int>(json['farmerId']),
      cropType: serializer.fromJson<String>(json['cropType']),
      quantityKg: serializer.fromJson<double>(json['quantityKg']),
      pricePerKg: serializer.fromJson<double>(json['pricePerKg']),
      totalAmount: serializer.fromJson<double>(json['totalAmount']),
      date: serializer.fromJson<String>(json['date']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'farmerId': serializer.toJson<int>(farmerId),
      'cropType': serializer.toJson<String>(cropType),
      'quantityKg': serializer.toJson<double>(quantityKg),
      'pricePerKg': serializer.toJson<double>(pricePerKg),
      'totalAmount': serializer.toJson<double>(totalAmount),
      'date': serializer.toJson<String>(date),
      'isSynced': serializer.toJson<bool>(isSynced),
    };
  }

  Sale copyWith(
          {int? id,
          int? farmerId,
          String? cropType,
          double? quantityKg,
          double? pricePerKg,
          double? totalAmount,
          String? date,
          bool? isSynced}) =>
      Sale(
        id: id ?? this.id,
        farmerId: farmerId ?? this.farmerId,
        cropType: cropType ?? this.cropType,
        quantityKg: quantityKg ?? this.quantityKg,
        pricePerKg: pricePerKg ?? this.pricePerKg,
        totalAmount: totalAmount ?? this.totalAmount,
        date: date ?? this.date,
        isSynced: isSynced ?? this.isSynced,
      );
  Sale copyWithCompanion(SalesCompanion data) {
    return Sale(
      id: data.id.present ? data.id.value : this.id,
      farmerId: data.farmerId.present ? data.farmerId.value : this.farmerId,
      cropType: data.cropType.present ? data.cropType.value : this.cropType,
      quantityKg:
          data.quantityKg.present ? data.quantityKg.value : this.quantityKg,
      pricePerKg:
          data.pricePerKg.present ? data.pricePerKg.value : this.pricePerKg,
      totalAmount:
          data.totalAmount.present ? data.totalAmount.value : this.totalAmount,
      date: data.date.present ? data.date.value : this.date,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Sale(')
          ..write('id: $id, ')
          ..write('farmerId: $farmerId, ')
          ..write('cropType: $cropType, ')
          ..write('quantityKg: $quantityKg, ')
          ..write('pricePerKg: $pricePerKg, ')
          ..write('totalAmount: $totalAmount, ')
          ..write('date: $date, ')
          ..write('isSynced: $isSynced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, farmerId, cropType, quantityKg,
      pricePerKg, totalAmount, date, isSynced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Sale &&
          other.id == this.id &&
          other.farmerId == this.farmerId &&
          other.cropType == this.cropType &&
          other.quantityKg == this.quantityKg &&
          other.pricePerKg == this.pricePerKg &&
          other.totalAmount == this.totalAmount &&
          other.date == this.date &&
          other.isSynced == this.isSynced);
}

class SalesCompanion extends UpdateCompanion<Sale> {
  final Value<int> id;
  final Value<int> farmerId;
  final Value<String> cropType;
  final Value<double> quantityKg;
  final Value<double> pricePerKg;
  final Value<double> totalAmount;
  final Value<String> date;
  final Value<bool> isSynced;
  const SalesCompanion({
    this.id = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.cropType = const Value.absent(),
    this.quantityKg = const Value.absent(),
    this.pricePerKg = const Value.absent(),
    this.totalAmount = const Value.absent(),
    this.date = const Value.absent(),
    this.isSynced = const Value.absent(),
  });
  SalesCompanion.insert({
    this.id = const Value.absent(),
    required int farmerId,
    required String cropType,
    required double quantityKg,
    required double pricePerKg,
    required double totalAmount,
    required String date,
    this.isSynced = const Value.absent(),
  })  : farmerId = Value(farmerId),
        cropType = Value(cropType),
        quantityKg = Value(quantityKg),
        pricePerKg = Value(pricePerKg),
        totalAmount = Value(totalAmount),
        date = Value(date);
  static Insertable<Sale> custom({
    Expression<int>? id,
    Expression<int>? farmerId,
    Expression<String>? cropType,
    Expression<double>? quantityKg,
    Expression<double>? pricePerKg,
    Expression<double>? totalAmount,
    Expression<String>? date,
    Expression<bool>? isSynced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (farmerId != null) 'farmer_id': farmerId,
      if (cropType != null) 'crop_type': cropType,
      if (quantityKg != null) 'quantity_kg': quantityKg,
      if (pricePerKg != null) 'price_per_kg': pricePerKg,
      if (totalAmount != null) 'total_amount': totalAmount,
      if (date != null) 'date': date,
      if (isSynced != null) 'is_synced': isSynced,
    });
  }

  SalesCompanion copyWith(
      {Value<int>? id,
      Value<int>? farmerId,
      Value<String>? cropType,
      Value<double>? quantityKg,
      Value<double>? pricePerKg,
      Value<double>? totalAmount,
      Value<String>? date,
      Value<bool>? isSynced}) {
    return SalesCompanion(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      cropType: cropType ?? this.cropType,
      quantityKg: quantityKg ?? this.quantityKg,
      pricePerKg: pricePerKg ?? this.pricePerKg,
      totalAmount: totalAmount ?? this.totalAmount,
      date: date ?? this.date,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<int>(farmerId.value);
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
    if (totalAmount.present) {
      map['total_amount'] = Variable<double>(totalAmount.value);
    }
    if (date.present) {
      map['date'] = Variable<String>(date.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SalesCompanion(')
          ..write('id: $id, ')
          ..write('farmerId: $farmerId, ')
          ..write('cropType: $cropType, ')
          ..write('quantityKg: $quantityKg, ')
          ..write('pricePerKg: $pricePerKg, ')
          ..write('totalAmount: $totalAmount, ')
          ..write('date: $date, ')
          ..write('isSynced: $isSynced')
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
  static const VerificationMeta _topicMeta = const VerificationMeta('topic');
  @override
  late final GeneratedColumn<String> topic = GeneratedColumn<String>(
      'topic', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<String> date = GeneratedColumn<String>(
      'date', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _locationMeta =
      const VerificationMeta('location');
  @override
  late final GeneratedColumn<String> location = GeneratedColumn<String>(
      'location', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, topic, date, location];
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
      topic: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}topic'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}date'])!,
      location: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}location'])!,
    );
  }

  @override
  $TrainingsTable createAlias(String alias) {
    return $TrainingsTable(attachedDatabase, alias);
  }
}

class Training extends DataClass implements Insertable<Training> {
  final int id;
  final String topic;
  final String date;
  final String location;
  const Training(
      {required this.id,
      required this.topic,
      required this.date,
      required this.location});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['topic'] = Variable<String>(topic);
    map['date'] = Variable<String>(date);
    map['location'] = Variable<String>(location);
    return map;
  }

  TrainingsCompanion toCompanion(bool nullToAbsent) {
    return TrainingsCompanion(
      id: Value(id),
      topic: Value(topic),
      date: Value(date),
      location: Value(location),
    );
  }

  factory Training.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Training(
      id: serializer.fromJson<int>(json['id']),
      topic: serializer.fromJson<String>(json['topic']),
      date: serializer.fromJson<String>(json['date']),
      location: serializer.fromJson<String>(json['location']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'topic': serializer.toJson<String>(topic),
      'date': serializer.toJson<String>(date),
      'location': serializer.toJson<String>(location),
    };
  }

  Training copyWith({int? id, String? topic, String? date, String? location}) =>
      Training(
        id: id ?? this.id,
        topic: topic ?? this.topic,
        date: date ?? this.date,
        location: location ?? this.location,
      );
  Training copyWithCompanion(TrainingsCompanion data) {
    return Training(
      id: data.id.present ? data.id.value : this.id,
      topic: data.topic.present ? data.topic.value : this.topic,
      date: data.date.present ? data.date.value : this.date,
      location: data.location.present ? data.location.value : this.location,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Training(')
          ..write('id: $id, ')
          ..write('topic: $topic, ')
          ..write('date: $date, ')
          ..write('location: $location')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, topic, date, location);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Training &&
          other.id == this.id &&
          other.topic == this.topic &&
          other.date == this.date &&
          other.location == this.location);
}

class TrainingsCompanion extends UpdateCompanion<Training> {
  final Value<int> id;
  final Value<String> topic;
  final Value<String> date;
  final Value<String> location;
  const TrainingsCompanion({
    this.id = const Value.absent(),
    this.topic = const Value.absent(),
    this.date = const Value.absent(),
    this.location = const Value.absent(),
  });
  TrainingsCompanion.insert({
    this.id = const Value.absent(),
    required String topic,
    required String date,
    required String location,
  })  : topic = Value(topic),
        date = Value(date),
        location = Value(location);
  static Insertable<Training> custom({
    Expression<int>? id,
    Expression<String>? topic,
    Expression<String>? date,
    Expression<String>? location,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (topic != null) 'topic': topic,
      if (date != null) 'date': date,
      if (location != null) 'location': location,
    });
  }

  TrainingsCompanion copyWith(
      {Value<int>? id,
      Value<String>? topic,
      Value<String>? date,
      Value<String>? location}) {
    return TrainingsCompanion(
      id: id ?? this.id,
      topic: topic ?? this.topic,
      date: date ?? this.date,
      location: location ?? this.location,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (topic.present) {
      map['topic'] = Variable<String>(topic.value);
    }
    if (date.present) {
      map['date'] = Variable<String>(date.value);
    }
    if (location.present) {
      map['location'] = Variable<String>(location.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TrainingsCompanion(')
          ..write('id: $id, ')
          ..write('topic: $topic, ')
          ..write('date: $date, ')
          ..write('location: $location')
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
  static const VerificationMeta _trainingIdMeta =
      const VerificationMeta('trainingId');
  @override
  late final GeneratedColumn<int> trainingId = GeneratedColumn<int>(
      'training_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES trainings (id)'));
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<int> farmerId = GeneratedColumn<int>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES farmers (id)'));
  static const VerificationMeta _timestampMeta =
      const VerificationMeta('timestamp');
  @override
  late final GeneratedColumn<String> timestamp = GeneratedColumn<String>(
      'timestamp', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns =>
      [id, trainingId, farmerId, timestamp, isSynced];
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
    if (data.containsKey('training_id')) {
      context.handle(
          _trainingIdMeta,
          trainingId.isAcceptableOrUnknown(
              data['training_id']!, _trainingIdMeta));
    } else if (isInserting) {
      context.missing(_trainingIdMeta);
    }
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
    }
    if (data.containsKey('timestamp')) {
      context.handle(_timestampMeta,
          timestamp.isAcceptableOrUnknown(data['timestamp']!, _timestampMeta));
    } else if (isInserting) {
      context.missing(_timestampMeta);
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
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
      trainingId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}training_id'])!,
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}farmer_id'])!,
      timestamp: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}timestamp'])!,
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
    );
  }

  @override
  $AttendanceTable createAlias(String alias) {
    return $AttendanceTable(attachedDatabase, alias);
  }
}

class AttendanceData extends DataClass implements Insertable<AttendanceData> {
  final int id;
  final int trainingId;
  final int farmerId;
  final String timestamp;
  final bool isSynced;
  const AttendanceData(
      {required this.id,
      required this.trainingId,
      required this.farmerId,
      required this.timestamp,
      required this.isSynced});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['training_id'] = Variable<int>(trainingId);
    map['farmer_id'] = Variable<int>(farmerId);
    map['timestamp'] = Variable<String>(timestamp);
    map['is_synced'] = Variable<bool>(isSynced);
    return map;
  }

  AttendanceCompanion toCompanion(bool nullToAbsent) {
    return AttendanceCompanion(
      id: Value(id),
      trainingId: Value(trainingId),
      farmerId: Value(farmerId),
      timestamp: Value(timestamp),
      isSynced: Value(isSynced),
    );
  }

  factory AttendanceData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AttendanceData(
      id: serializer.fromJson<int>(json['id']),
      trainingId: serializer.fromJson<int>(json['trainingId']),
      farmerId: serializer.fromJson<int>(json['farmerId']),
      timestamp: serializer.fromJson<String>(json['timestamp']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'trainingId': serializer.toJson<int>(trainingId),
      'farmerId': serializer.toJson<int>(farmerId),
      'timestamp': serializer.toJson<String>(timestamp),
      'isSynced': serializer.toJson<bool>(isSynced),
    };
  }

  AttendanceData copyWith(
          {int? id,
          int? trainingId,
          int? farmerId,
          String? timestamp,
          bool? isSynced}) =>
      AttendanceData(
        id: id ?? this.id,
        trainingId: trainingId ?? this.trainingId,
        farmerId: farmerId ?? this.farmerId,
        timestamp: timestamp ?? this.timestamp,
        isSynced: isSynced ?? this.isSynced,
      );
  AttendanceData copyWithCompanion(AttendanceCompanion data) {
    return AttendanceData(
      id: data.id.present ? data.id.value : this.id,
      trainingId:
          data.trainingId.present ? data.trainingId.value : this.trainingId,
      farmerId: data.farmerId.present ? data.farmerId.value : this.farmerId,
      timestamp: data.timestamp.present ? data.timestamp.value : this.timestamp,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AttendanceData(')
          ..write('id: $id, ')
          ..write('trainingId: $trainingId, ')
          ..write('farmerId: $farmerId, ')
          ..write('timestamp: $timestamp, ')
          ..write('isSynced: $isSynced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, trainingId, farmerId, timestamp, isSynced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AttendanceData &&
          other.id == this.id &&
          other.trainingId == this.trainingId &&
          other.farmerId == this.farmerId &&
          other.timestamp == this.timestamp &&
          other.isSynced == this.isSynced);
}

class AttendanceCompanion extends UpdateCompanion<AttendanceData> {
  final Value<int> id;
  final Value<int> trainingId;
  final Value<int> farmerId;
  final Value<String> timestamp;
  final Value<bool> isSynced;
  const AttendanceCompanion({
    this.id = const Value.absent(),
    this.trainingId = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.timestamp = const Value.absent(),
    this.isSynced = const Value.absent(),
  });
  AttendanceCompanion.insert({
    this.id = const Value.absent(),
    required int trainingId,
    required int farmerId,
    required String timestamp,
    this.isSynced = const Value.absent(),
  })  : trainingId = Value(trainingId),
        farmerId = Value(farmerId),
        timestamp = Value(timestamp);
  static Insertable<AttendanceData> custom({
    Expression<int>? id,
    Expression<int>? trainingId,
    Expression<int>? farmerId,
    Expression<String>? timestamp,
    Expression<bool>? isSynced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (trainingId != null) 'training_id': trainingId,
      if (farmerId != null) 'farmer_id': farmerId,
      if (timestamp != null) 'timestamp': timestamp,
      if (isSynced != null) 'is_synced': isSynced,
    });
  }

  AttendanceCompanion copyWith(
      {Value<int>? id,
      Value<int>? trainingId,
      Value<int>? farmerId,
      Value<String>? timestamp,
      Value<bool>? isSynced}) {
    return AttendanceCompanion(
      id: id ?? this.id,
      trainingId: trainingId ?? this.trainingId,
      farmerId: farmerId ?? this.farmerId,
      timestamp: timestamp ?? this.timestamp,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (trainingId.present) {
      map['training_id'] = Variable<int>(trainingId.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<int>(farmerId.value);
    }
    if (timestamp.present) {
      map['timestamp'] = Variable<String>(timestamp.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AttendanceCompanion(')
          ..write('id: $id, ')
          ..write('trainingId: $trainingId, ')
          ..write('farmerId: $farmerId, ')
          ..write('timestamp: $timestamp, ')
          ..write('isSynced: $isSynced')
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
  static const VerificationMeta _farmerIdMeta =
      const VerificationMeta('farmerId');
  @override
  late final GeneratedColumn<int> farmerId = GeneratedColumn<int>(
      'farmer_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES farmers (id)'));
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
  static const VerificationMeta _dateMeta = const VerificationMeta('date');
  @override
  late final GeneratedColumn<String> date = GeneratedColumn<String>(
      'date', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns =>
      [id, farmerId, amount, type, date, isSynced];
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
    if (data.containsKey('farmer_id')) {
      context.handle(_farmerIdMeta,
          farmerId.isAcceptableOrUnknown(data['farmer_id']!, _farmerIdMeta));
    } else if (isInserting) {
      context.missing(_farmerIdMeta);
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
    if (data.containsKey('date')) {
      context.handle(
          _dateMeta, date.isAcceptableOrUnknown(data['date']!, _dateMeta));
    } else if (isInserting) {
      context.missing(_dateMeta);
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
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
      farmerId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}farmer_id'])!,
      amount: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}amount'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      date: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}date'])!,
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
    );
  }

  @override
  $VSLATransactionsTable createAlias(String alias) {
    return $VSLATransactionsTable(attachedDatabase, alias);
  }
}

class VSLATransaction extends DataClass implements Insertable<VSLATransaction> {
  final int id;
  final int farmerId;
  final double amount;
  final String type;
  final String date;
  final bool isSynced;
  const VSLATransaction(
      {required this.id,
      required this.farmerId,
      required this.amount,
      required this.type,
      required this.date,
      required this.isSynced});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['farmer_id'] = Variable<int>(farmerId);
    map['amount'] = Variable<double>(amount);
    map['type'] = Variable<String>(type);
    map['date'] = Variable<String>(date);
    map['is_synced'] = Variable<bool>(isSynced);
    return map;
  }

  VSLATransactionsCompanion toCompanion(bool nullToAbsent) {
    return VSLATransactionsCompanion(
      id: Value(id),
      farmerId: Value(farmerId),
      amount: Value(amount),
      type: Value(type),
      date: Value(date),
      isSynced: Value(isSynced),
    );
  }

  factory VSLATransaction.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return VSLATransaction(
      id: serializer.fromJson<int>(json['id']),
      farmerId: serializer.fromJson<int>(json['farmerId']),
      amount: serializer.fromJson<double>(json['amount']),
      type: serializer.fromJson<String>(json['type']),
      date: serializer.fromJson<String>(json['date']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'farmerId': serializer.toJson<int>(farmerId),
      'amount': serializer.toJson<double>(amount),
      'type': serializer.toJson<String>(type),
      'date': serializer.toJson<String>(date),
      'isSynced': serializer.toJson<bool>(isSynced),
    };
  }

  VSLATransaction copyWith(
          {int? id,
          int? farmerId,
          double? amount,
          String? type,
          String? date,
          bool? isSynced}) =>
      VSLATransaction(
        id: id ?? this.id,
        farmerId: farmerId ?? this.farmerId,
        amount: amount ?? this.amount,
        type: type ?? this.type,
        date: date ?? this.date,
        isSynced: isSynced ?? this.isSynced,
      );
  VSLATransaction copyWithCompanion(VSLATransactionsCompanion data) {
    return VSLATransaction(
      id: data.id.present ? data.id.value : this.id,
      farmerId: data.farmerId.present ? data.farmerId.value : this.farmerId,
      amount: data.amount.present ? data.amount.value : this.amount,
      type: data.type.present ? data.type.value : this.type,
      date: data.date.present ? data.date.value : this.date,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('VSLATransaction(')
          ..write('id: $id, ')
          ..write('farmerId: $farmerId, ')
          ..write('amount: $amount, ')
          ..write('type: $type, ')
          ..write('date: $date, ')
          ..write('isSynced: $isSynced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, farmerId, amount, type, date, isSynced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is VSLATransaction &&
          other.id == this.id &&
          other.farmerId == this.farmerId &&
          other.amount == this.amount &&
          other.type == this.type &&
          other.date == this.date &&
          other.isSynced == this.isSynced);
}

class VSLATransactionsCompanion extends UpdateCompanion<VSLATransaction> {
  final Value<int> id;
  final Value<int> farmerId;
  final Value<double> amount;
  final Value<String> type;
  final Value<String> date;
  final Value<bool> isSynced;
  const VSLATransactionsCompanion({
    this.id = const Value.absent(),
    this.farmerId = const Value.absent(),
    this.amount = const Value.absent(),
    this.type = const Value.absent(),
    this.date = const Value.absent(),
    this.isSynced = const Value.absent(),
  });
  VSLATransactionsCompanion.insert({
    this.id = const Value.absent(),
    required int farmerId,
    required double amount,
    required String type,
    required String date,
    this.isSynced = const Value.absent(),
  })  : farmerId = Value(farmerId),
        amount = Value(amount),
        type = Value(type),
        date = Value(date);
  static Insertable<VSLATransaction> custom({
    Expression<int>? id,
    Expression<int>? farmerId,
    Expression<double>? amount,
    Expression<String>? type,
    Expression<String>? date,
    Expression<bool>? isSynced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (farmerId != null) 'farmer_id': farmerId,
      if (amount != null) 'amount': amount,
      if (type != null) 'type': type,
      if (date != null) 'date': date,
      if (isSynced != null) 'is_synced': isSynced,
    });
  }

  VSLATransactionsCompanion copyWith(
      {Value<int>? id,
      Value<int>? farmerId,
      Value<double>? amount,
      Value<String>? type,
      Value<String>? date,
      Value<bool>? isSynced}) {
    return VSLATransactionsCompanion(
      id: id ?? this.id,
      farmerId: farmerId ?? this.farmerId,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      date: date ?? this.date,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (farmerId.present) {
      map['farmer_id'] = Variable<int>(farmerId.value);
    }
    if (amount.present) {
      map['amount'] = Variable<double>(amount.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (date.present) {
      map['date'] = Variable<String>(date.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VSLATransactionsCompanion(')
          ..write('id: $id, ')
          ..write('farmerId: $farmerId, ')
          ..write('amount: $amount, ')
          ..write('type: $type, ')
          ..write('date: $date, ')
          ..write('isSynced: $isSynced')
          ..write(')'))
        .toString();
  }
}

class $SyncInfoTable extends SyncInfo
    with TableInfo<$SyncInfoTable, SyncInfoData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncInfoTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _entityMeta = const VerificationMeta('entity');
  @override
  late final GeneratedColumn<String> entity = GeneratedColumn<String>(
      'entity', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _lastSyncMeta =
      const VerificationMeta('lastSync');
  @override
  late final GeneratedColumn<String> lastSync = GeneratedColumn<String>(
      'last_sync', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, entity, lastSync];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_info';
  @override
  VerificationContext validateIntegrity(Insertable<SyncInfoData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('entity')) {
      context.handle(_entityMeta,
          entity.isAcceptableOrUnknown(data['entity']!, _entityMeta));
    } else if (isInserting) {
      context.missing(_entityMeta);
    }
    if (data.containsKey('last_sync')) {
      context.handle(_lastSyncMeta,
          lastSync.isAcceptableOrUnknown(data['last_sync']!, _lastSyncMeta));
    } else if (isInserting) {
      context.missing(_lastSyncMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SyncInfoData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncInfoData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      entity: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity'])!,
      lastSync: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_sync'])!,
    );
  }

  @override
  $SyncInfoTable createAlias(String alias) {
    return $SyncInfoTable(attachedDatabase, alias);
  }
}

class SyncInfoData extends DataClass implements Insertable<SyncInfoData> {
  final int id;
  final String entity;
  final String lastSync;
  const SyncInfoData(
      {required this.id, required this.entity, required this.lastSync});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['entity'] = Variable<String>(entity);
    map['last_sync'] = Variable<String>(lastSync);
    return map;
  }

  SyncInfoCompanion toCompanion(bool nullToAbsent) {
    return SyncInfoCompanion(
      id: Value(id),
      entity: Value(entity),
      lastSync: Value(lastSync),
    );
  }

  factory SyncInfoData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncInfoData(
      id: serializer.fromJson<int>(json['id']),
      entity: serializer.fromJson<String>(json['entity']),
      lastSync: serializer.fromJson<String>(json['lastSync']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'entity': serializer.toJson<String>(entity),
      'lastSync': serializer.toJson<String>(lastSync),
    };
  }

  SyncInfoData copyWith({int? id, String? entity, String? lastSync}) =>
      SyncInfoData(
        id: id ?? this.id,
        entity: entity ?? this.entity,
        lastSync: lastSync ?? this.lastSync,
      );
  SyncInfoData copyWithCompanion(SyncInfoCompanion data) {
    return SyncInfoData(
      id: data.id.present ? data.id.value : this.id,
      entity: data.entity.present ? data.entity.value : this.entity,
      lastSync: data.lastSync.present ? data.lastSync.value : this.lastSync,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncInfoData(')
          ..write('id: $id, ')
          ..write('entity: $entity, ')
          ..write('lastSync: $lastSync')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, entity, lastSync);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncInfoData &&
          other.id == this.id &&
          other.entity == this.entity &&
          other.lastSync == this.lastSync);
}

class SyncInfoCompanion extends UpdateCompanion<SyncInfoData> {
  final Value<int> id;
  final Value<String> entity;
  final Value<String> lastSync;
  const SyncInfoCompanion({
    this.id = const Value.absent(),
    this.entity = const Value.absent(),
    this.lastSync = const Value.absent(),
  });
  SyncInfoCompanion.insert({
    this.id = const Value.absent(),
    required String entity,
    required String lastSync,
  })  : entity = Value(entity),
        lastSync = Value(lastSync);
  static Insertable<SyncInfoData> custom({
    Expression<int>? id,
    Expression<String>? entity,
    Expression<String>? lastSync,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (entity != null) 'entity': entity,
      if (lastSync != null) 'last_sync': lastSync,
    });
  }

  SyncInfoCompanion copyWith(
      {Value<int>? id, Value<String>? entity, Value<String>? lastSync}) {
    return SyncInfoCompanion(
      id: id ?? this.id,
      entity: entity ?? this.entity,
      lastSync: lastSync ?? this.lastSync,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (entity.present) {
      map['entity'] = Variable<String>(entity.value);
    }
    if (lastSync.present) {
      map['last_sync'] = Variable<String>(lastSync.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncInfoCompanion(')
          ..write('id: $id, ')
          ..write('entity: $entity, ')
          ..write('lastSync: $lastSync')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $FarmersTable farmers = $FarmersTable(this);
  late final $SalesTable sales = $SalesTable(this);
  late final $TrainingsTable trainings = $TrainingsTable(this);
  late final $AttendanceTable attendance = $AttendanceTable(this);
  late final $VSLATransactionsTable vSLATransactions =
      $VSLATransactionsTable(this);
  late final $SyncInfoTable syncInfo = $SyncInfoTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [farmers, sales, trainings, attendance, vSLATransactions, syncInfo];
}

typedef $$FarmersTableCreateCompanionBuilder = FarmersCompanion Function({
  Value<int> id,
  Value<String?> remoteId,
  required String fullName,
  required String nationalId,
  required double landSizeHa,
  Value<String?> locationStr,
  Value<bool> isSynced,
});
typedef $$FarmersTableUpdateCompanionBuilder = FarmersCompanion Function({
  Value<int> id,
  Value<String?> remoteId,
  Value<String> fullName,
  Value<String> nationalId,
  Value<double> landSizeHa,
  Value<String?> locationStr,
  Value<bool> isSynced,
});

final class $$FarmersTableReferences
    extends BaseReferences<_$AppDatabase, $FarmersTable, Farmer> {
  $$FarmersTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$SalesTable, List<Sale>> _salesRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.sales,
          aliasName: $_aliasNameGenerator(db.farmers.id, db.sales.farmerId));

  $$SalesTableProcessedTableManager get salesRefs {
    final manager = $$SalesTableTableManager($_db, $_db.sales)
        .filter((f) => f.farmerId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_salesRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$AttendanceTable, List<AttendanceData>>
      _attendanceRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.attendance,
              aliasName:
                  $_aliasNameGenerator(db.farmers.id, db.attendance.farmerId));

  $$AttendanceTableProcessedTableManager get attendanceRefs {
    final manager = $$AttendanceTableTableManager($_db, $_db.attendance)
        .filter((f) => f.farmerId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_attendanceRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$VSLATransactionsTable, List<VSLATransaction>>
      _vSLATransactionsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.vSLATransactions,
              aliasName: $_aliasNameGenerator(
                  db.farmers.id, db.vSLATransactions.farmerId));

  $$VSLATransactionsTableProcessedTableManager get vSLATransactionsRefs {
    final manager =
        $$VSLATransactionsTableTableManager($_db, $_db.vSLATransactions)
            .filter((f) => f.farmerId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache =
        $_typedResult.readTableOrNull(_vSLATransactionsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$FarmersTableFilterComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get remoteId => $composableBuilder(
      column: $table.remoteId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get nationalId => $composableBuilder(
      column: $table.nationalId, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get landSizeHa => $composableBuilder(
      column: $table.landSizeHa, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get locationStr => $composableBuilder(
      column: $table.locationStr, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnFilters(column));

  Expression<bool> salesRefs(
      Expression<bool> Function($$SalesTableFilterComposer f) f) {
    final $$SalesTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sales,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SalesTableFilterComposer(
              $db: $db,
              $table: $db.sales,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> attendanceRefs(
      Expression<bool> Function($$AttendanceTableFilterComposer f) f) {
    final $$AttendanceTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.attendance,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AttendanceTableFilterComposer(
              $db: $db,
              $table: $db.attendance,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> vSLATransactionsRefs(
      Expression<bool> Function($$VSLATransactionsTableFilterComposer f) f) {
    final $$VSLATransactionsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.vSLATransactions,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$VSLATransactionsTableFilterComposer(
              $db: $db,
              $table: $db.vSLATransactions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$FarmersTableOrderingComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get remoteId => $composableBuilder(
      column: $table.remoteId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get nationalId => $composableBuilder(
      column: $table.nationalId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get landSizeHa => $composableBuilder(
      column: $table.landSizeHa, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get locationStr => $composableBuilder(
      column: $table.locationStr, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnOrderings(column));
}

class $$FarmersTableAnnotationComposer
    extends Composer<_$AppDatabase, $FarmersTable> {
  $$FarmersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get remoteId =>
      $composableBuilder(column: $table.remoteId, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);

  GeneratedColumn<String> get nationalId => $composableBuilder(
      column: $table.nationalId, builder: (column) => column);

  GeneratedColumn<double> get landSizeHa => $composableBuilder(
      column: $table.landSizeHa, builder: (column) => column);

  GeneratedColumn<String> get locationStr => $composableBuilder(
      column: $table.locationStr, builder: (column) => column);

  GeneratedColumn<bool> get isSynced =>
      $composableBuilder(column: $table.isSynced, builder: (column) => column);

  Expression<T> salesRefs<T extends Object>(
      Expression<T> Function($$SalesTableAnnotationComposer a) f) {
    final $$SalesTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sales,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SalesTableAnnotationComposer(
              $db: $db,
              $table: $db.sales,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> attendanceRefs<T extends Object>(
      Expression<T> Function($$AttendanceTableAnnotationComposer a) f) {
    final $$AttendanceTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.attendance,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AttendanceTableAnnotationComposer(
              $db: $db,
              $table: $db.attendance,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> vSLATransactionsRefs<T extends Object>(
      Expression<T> Function($$VSLATransactionsTableAnnotationComposer a) f) {
    final $$VSLATransactionsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.vSLATransactions,
        getReferencedColumn: (t) => t.farmerId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$VSLATransactionsTableAnnotationComposer(
              $db: $db,
              $table: $db.vSLATransactions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$FarmersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $FarmersTable,
    Farmer,
    $$FarmersTableFilterComposer,
    $$FarmersTableOrderingComposer,
    $$FarmersTableAnnotationComposer,
    $$FarmersTableCreateCompanionBuilder,
    $$FarmersTableUpdateCompanionBuilder,
    (Farmer, $$FarmersTableReferences),
    Farmer,
    PrefetchHooks Function(
        {bool salesRefs, bool attendanceRefs, bool vSLATransactionsRefs})> {
  $$FarmersTableTableManager(_$AppDatabase db, $FarmersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$FarmersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$FarmersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$FarmersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> remoteId = const Value.absent(),
            Value<String> fullName = const Value.absent(),
            Value<String> nationalId = const Value.absent(),
            Value<double> landSizeHa = const Value.absent(),
            Value<String?> locationStr = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
          }) =>
              FarmersCompanion(
            id: id,
            remoteId: remoteId,
            fullName: fullName,
            nationalId: nationalId,
            landSizeHa: landSizeHa,
            locationStr: locationStr,
            isSynced: isSynced,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> remoteId = const Value.absent(),
            required String fullName,
            required String nationalId,
            required double landSizeHa,
            Value<String?> locationStr = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
          }) =>
              FarmersCompanion.insert(
            id: id,
            remoteId: remoteId,
            fullName: fullName,
            nationalId: nationalId,
            landSizeHa: landSizeHa,
            locationStr: locationStr,
            isSynced: isSynced,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$FarmersTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {salesRefs = false,
              attendanceRefs = false,
              vSLATransactionsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (salesRefs) db.sales,
                if (attendanceRefs) db.attendance,
                if (vSLATransactionsRefs) db.vSLATransactions
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (salesRefs)
                    await $_getPrefetchedData<Farmer, $FarmersTable, Sale>(
                        currentTable: table,
                        referencedTable:
                            $$FarmersTableReferences._salesRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$FarmersTableReferences(db, table, p0).salesRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.farmerId == item.id),
                        typedResults: items),
                  if (attendanceRefs)
                    await $_getPrefetchedData<Farmer, $FarmersTable,
                            AttendanceData>(
                        currentTable: table,
                        referencedTable:
                            $$FarmersTableReferences._attendanceRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$FarmersTableReferences(db, table, p0)
                                .attendanceRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.farmerId == item.id),
                        typedResults: items),
                  if (vSLATransactionsRefs)
                    await $_getPrefetchedData<Farmer, $FarmersTable,
                            VSLATransaction>(
                        currentTable: table,
                        referencedTable: $$FarmersTableReferences
                            ._vSLATransactionsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$FarmersTableReferences(db, table, p0)
                                .vSLATransactionsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.farmerId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$FarmersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $FarmersTable,
    Farmer,
    $$FarmersTableFilterComposer,
    $$FarmersTableOrderingComposer,
    $$FarmersTableAnnotationComposer,
    $$FarmersTableCreateCompanionBuilder,
    $$FarmersTableUpdateCompanionBuilder,
    (Farmer, $$FarmersTableReferences),
    Farmer,
    PrefetchHooks Function(
        {bool salesRefs, bool attendanceRefs, bool vSLATransactionsRefs})>;
typedef $$SalesTableCreateCompanionBuilder = SalesCompanion Function({
  Value<int> id,
  required int farmerId,
  required String cropType,
  required double quantityKg,
  required double pricePerKg,
  required double totalAmount,
  required String date,
  Value<bool> isSynced,
});
typedef $$SalesTableUpdateCompanionBuilder = SalesCompanion Function({
  Value<int> id,
  Value<int> farmerId,
  Value<String> cropType,
  Value<double> quantityKg,
  Value<double> pricePerKg,
  Value<double> totalAmount,
  Value<String> date,
  Value<bool> isSynced,
});

final class $$SalesTableReferences
    extends BaseReferences<_$AppDatabase, $SalesTable, Sale> {
  $$SalesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $FarmersTable _farmerIdTable(_$AppDatabase db) => db.farmers
      .createAlias($_aliasNameGenerator(db.sales.farmerId, db.farmers.id));

  $$FarmersTableProcessedTableManager get farmerId {
    final $_column = $_itemColumn<int>('farmer_id')!;

    final manager = $$FarmersTableTableManager($_db, $_db.farmers)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_farmerIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SalesTableFilterComposer extends Composer<_$AppDatabase, $SalesTable> {
  $$SalesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get cropType => $composableBuilder(
      column: $table.cropType, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get quantityKg => $composableBuilder(
      column: $table.quantityKg, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get pricePerKg => $composableBuilder(
      column: $table.pricePerKg, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get totalAmount => $composableBuilder(
      column: $table.totalAmount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnFilters(column));

  $$FarmersTableFilterComposer get farmerId {
    final $$FarmersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableFilterComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SalesTableOrderingComposer
    extends Composer<_$AppDatabase, $SalesTable> {
  $$SalesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get cropType => $composableBuilder(
      column: $table.cropType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get quantityKg => $composableBuilder(
      column: $table.quantityKg, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get pricePerKg => $composableBuilder(
      column: $table.pricePerKg, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get totalAmount => $composableBuilder(
      column: $table.totalAmount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnOrderings(column));

  $$FarmersTableOrderingComposer get farmerId {
    final $$FarmersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableOrderingComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SalesTableAnnotationComposer
    extends Composer<_$AppDatabase, $SalesTable> {
  $$SalesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get cropType =>
      $composableBuilder(column: $table.cropType, builder: (column) => column);

  GeneratedColumn<double> get quantityKg => $composableBuilder(
      column: $table.quantityKg, builder: (column) => column);

  GeneratedColumn<double> get pricePerKg => $composableBuilder(
      column: $table.pricePerKg, builder: (column) => column);

  GeneratedColumn<double> get totalAmount => $composableBuilder(
      column: $table.totalAmount, builder: (column) => column);

  GeneratedColumn<String> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  GeneratedColumn<bool> get isSynced =>
      $composableBuilder(column: $table.isSynced, builder: (column) => column);

  $$FarmersTableAnnotationComposer get farmerId {
    final $$FarmersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableAnnotationComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SalesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SalesTable,
    Sale,
    $$SalesTableFilterComposer,
    $$SalesTableOrderingComposer,
    $$SalesTableAnnotationComposer,
    $$SalesTableCreateCompanionBuilder,
    $$SalesTableUpdateCompanionBuilder,
    (Sale, $$SalesTableReferences),
    Sale,
    PrefetchHooks Function({bool farmerId})> {
  $$SalesTableTableManager(_$AppDatabase db, $SalesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SalesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SalesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SalesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> farmerId = const Value.absent(),
            Value<String> cropType = const Value.absent(),
            Value<double> quantityKg = const Value.absent(),
            Value<double> pricePerKg = const Value.absent(),
            Value<double> totalAmount = const Value.absent(),
            Value<String> date = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
          }) =>
              SalesCompanion(
            id: id,
            farmerId: farmerId,
            cropType: cropType,
            quantityKg: quantityKg,
            pricePerKg: pricePerKg,
            totalAmount: totalAmount,
            date: date,
            isSynced: isSynced,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int farmerId,
            required String cropType,
            required double quantityKg,
            required double pricePerKg,
            required double totalAmount,
            required String date,
            Value<bool> isSynced = const Value.absent(),
          }) =>
              SalesCompanion.insert(
            id: id,
            farmerId: farmerId,
            cropType: cropType,
            quantityKg: quantityKg,
            pricePerKg: pricePerKg,
            totalAmount: totalAmount,
            date: date,
            isSynced: isSynced,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$SalesTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({farmerId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (farmerId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.farmerId,
                    referencedTable: $$SalesTableReferences._farmerIdTable(db),
                    referencedColumn:
                        $$SalesTableReferences._farmerIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SalesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SalesTable,
    Sale,
    $$SalesTableFilterComposer,
    $$SalesTableOrderingComposer,
    $$SalesTableAnnotationComposer,
    $$SalesTableCreateCompanionBuilder,
    $$SalesTableUpdateCompanionBuilder,
    (Sale, $$SalesTableReferences),
    Sale,
    PrefetchHooks Function({bool farmerId})>;
typedef $$TrainingsTableCreateCompanionBuilder = TrainingsCompanion Function({
  Value<int> id,
  required String topic,
  required String date,
  required String location,
});
typedef $$TrainingsTableUpdateCompanionBuilder = TrainingsCompanion Function({
  Value<int> id,
  Value<String> topic,
  Value<String> date,
  Value<String> location,
});

final class $$TrainingsTableReferences
    extends BaseReferences<_$AppDatabase, $TrainingsTable, Training> {
  $$TrainingsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$AttendanceTable, List<AttendanceData>>
      _attendanceRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
          db.attendance,
          aliasName:
              $_aliasNameGenerator(db.trainings.id, db.attendance.trainingId));

  $$AttendanceTableProcessedTableManager get attendanceRefs {
    final manager = $$AttendanceTableTableManager($_db, $_db.attendance)
        .filter((f) => f.trainingId.id.sqlEquals($_itemColumn<int>('id')!));

    final cache = $_typedResult.readTableOrNull(_attendanceRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$TrainingsTableFilterComposer
    extends Composer<_$AppDatabase, $TrainingsTable> {
  $$TrainingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get topic => $composableBuilder(
      column: $table.topic, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get location => $composableBuilder(
      column: $table.location, builder: (column) => ColumnFilters(column));

  Expression<bool> attendanceRefs(
      Expression<bool> Function($$AttendanceTableFilterComposer f) f) {
    final $$AttendanceTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.attendance,
        getReferencedColumn: (t) => t.trainingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AttendanceTableFilterComposer(
              $db: $db,
              $table: $db.attendance,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$TrainingsTableOrderingComposer
    extends Composer<_$AppDatabase, $TrainingsTable> {
  $$TrainingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get topic => $composableBuilder(
      column: $table.topic, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get location => $composableBuilder(
      column: $table.location, builder: (column) => ColumnOrderings(column));
}

class $$TrainingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $TrainingsTable> {
  $$TrainingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get topic =>
      $composableBuilder(column: $table.topic, builder: (column) => column);

  GeneratedColumn<String> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  GeneratedColumn<String> get location =>
      $composableBuilder(column: $table.location, builder: (column) => column);

  Expression<T> attendanceRefs<T extends Object>(
      Expression<T> Function($$AttendanceTableAnnotationComposer a) f) {
    final $$AttendanceTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.attendance,
        getReferencedColumn: (t) => t.trainingId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AttendanceTableAnnotationComposer(
              $db: $db,
              $table: $db.attendance,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$TrainingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $TrainingsTable,
    Training,
    $$TrainingsTableFilterComposer,
    $$TrainingsTableOrderingComposer,
    $$TrainingsTableAnnotationComposer,
    $$TrainingsTableCreateCompanionBuilder,
    $$TrainingsTableUpdateCompanionBuilder,
    (Training, $$TrainingsTableReferences),
    Training,
    PrefetchHooks Function({bool attendanceRefs})> {
  $$TrainingsTableTableManager(_$AppDatabase db, $TrainingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TrainingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TrainingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TrainingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> topic = const Value.absent(),
            Value<String> date = const Value.absent(),
            Value<String> location = const Value.absent(),
          }) =>
              TrainingsCompanion(
            id: id,
            topic: topic,
            date: date,
            location: location,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String topic,
            required String date,
            required String location,
          }) =>
              TrainingsCompanion.insert(
            id: id,
            topic: topic,
            date: date,
            location: location,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$TrainingsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({attendanceRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (attendanceRefs) db.attendance],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (attendanceRefs)
                    await $_getPrefetchedData<Training, $TrainingsTable,
                            AttendanceData>(
                        currentTable: table,
                        referencedTable:
                            $$TrainingsTableReferences._attendanceRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$TrainingsTableReferences(db, table, p0)
                                .attendanceRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.trainingId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$TrainingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $TrainingsTable,
    Training,
    $$TrainingsTableFilterComposer,
    $$TrainingsTableOrderingComposer,
    $$TrainingsTableAnnotationComposer,
    $$TrainingsTableCreateCompanionBuilder,
    $$TrainingsTableUpdateCompanionBuilder,
    (Training, $$TrainingsTableReferences),
    Training,
    PrefetchHooks Function({bool attendanceRefs})>;
typedef $$AttendanceTableCreateCompanionBuilder = AttendanceCompanion Function({
  Value<int> id,
  required int trainingId,
  required int farmerId,
  required String timestamp,
  Value<bool> isSynced,
});
typedef $$AttendanceTableUpdateCompanionBuilder = AttendanceCompanion Function({
  Value<int> id,
  Value<int> trainingId,
  Value<int> farmerId,
  Value<String> timestamp,
  Value<bool> isSynced,
});

final class $$AttendanceTableReferences
    extends BaseReferences<_$AppDatabase, $AttendanceTable, AttendanceData> {
  $$AttendanceTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $TrainingsTable _trainingIdTable(_$AppDatabase db) =>
      db.trainings.createAlias(
          $_aliasNameGenerator(db.attendance.trainingId, db.trainings.id));

  $$TrainingsTableProcessedTableManager get trainingId {
    final $_column = $_itemColumn<int>('training_id')!;

    final manager = $$TrainingsTableTableManager($_db, $_db.trainings)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_trainingIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $FarmersTable _farmerIdTable(_$AppDatabase db) => db.farmers
      .createAlias($_aliasNameGenerator(db.attendance.farmerId, db.farmers.id));

  $$FarmersTableProcessedTableManager get farmerId {
    final $_column = $_itemColumn<int>('farmer_id')!;

    final manager = $$FarmersTableTableManager($_db, $_db.farmers)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_farmerIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$AttendanceTableFilterComposer
    extends Composer<_$AppDatabase, $AttendanceTable> {
  $$AttendanceTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get timestamp => $composableBuilder(
      column: $table.timestamp, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnFilters(column));

  $$TrainingsTableFilterComposer get trainingId {
    final $$TrainingsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.trainingId,
        referencedTable: $db.trainings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TrainingsTableFilterComposer(
              $db: $db,
              $table: $db.trainings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$FarmersTableFilterComposer get farmerId {
    final $$FarmersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableFilterComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AttendanceTableOrderingComposer
    extends Composer<_$AppDatabase, $AttendanceTable> {
  $$AttendanceTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get timestamp => $composableBuilder(
      column: $table.timestamp, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnOrderings(column));

  $$TrainingsTableOrderingComposer get trainingId {
    final $$TrainingsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.trainingId,
        referencedTable: $db.trainings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TrainingsTableOrderingComposer(
              $db: $db,
              $table: $db.trainings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$FarmersTableOrderingComposer get farmerId {
    final $$FarmersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableOrderingComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AttendanceTableAnnotationComposer
    extends Composer<_$AppDatabase, $AttendanceTable> {
  $$AttendanceTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get timestamp =>
      $composableBuilder(column: $table.timestamp, builder: (column) => column);

  GeneratedColumn<bool> get isSynced =>
      $composableBuilder(column: $table.isSynced, builder: (column) => column);

  $$TrainingsTableAnnotationComposer get trainingId {
    final $$TrainingsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.trainingId,
        referencedTable: $db.trainings,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TrainingsTableAnnotationComposer(
              $db: $db,
              $table: $db.trainings,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$FarmersTableAnnotationComposer get farmerId {
    final $$FarmersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableAnnotationComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AttendanceTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AttendanceTable,
    AttendanceData,
    $$AttendanceTableFilterComposer,
    $$AttendanceTableOrderingComposer,
    $$AttendanceTableAnnotationComposer,
    $$AttendanceTableCreateCompanionBuilder,
    $$AttendanceTableUpdateCompanionBuilder,
    (AttendanceData, $$AttendanceTableReferences),
    AttendanceData,
    PrefetchHooks Function({bool trainingId, bool farmerId})> {
  $$AttendanceTableTableManager(_$AppDatabase db, $AttendanceTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AttendanceTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AttendanceTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AttendanceTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> trainingId = const Value.absent(),
            Value<int> farmerId = const Value.absent(),
            Value<String> timestamp = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
          }) =>
              AttendanceCompanion(
            id: id,
            trainingId: trainingId,
            farmerId: farmerId,
            timestamp: timestamp,
            isSynced: isSynced,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int trainingId,
            required int farmerId,
            required String timestamp,
            Value<bool> isSynced = const Value.absent(),
          }) =>
              AttendanceCompanion.insert(
            id: id,
            trainingId: trainingId,
            farmerId: farmerId,
            timestamp: timestamp,
            isSynced: isSynced,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$AttendanceTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({trainingId = false, farmerId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (trainingId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.trainingId,
                    referencedTable:
                        $$AttendanceTableReferences._trainingIdTable(db),
                    referencedColumn:
                        $$AttendanceTableReferences._trainingIdTable(db).id,
                  ) as T;
                }
                if (farmerId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.farmerId,
                    referencedTable:
                        $$AttendanceTableReferences._farmerIdTable(db),
                    referencedColumn:
                        $$AttendanceTableReferences._farmerIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$AttendanceTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AttendanceTable,
    AttendanceData,
    $$AttendanceTableFilterComposer,
    $$AttendanceTableOrderingComposer,
    $$AttendanceTableAnnotationComposer,
    $$AttendanceTableCreateCompanionBuilder,
    $$AttendanceTableUpdateCompanionBuilder,
    (AttendanceData, $$AttendanceTableReferences),
    AttendanceData,
    PrefetchHooks Function({bool trainingId, bool farmerId})>;
typedef $$VSLATransactionsTableCreateCompanionBuilder
    = VSLATransactionsCompanion Function({
  Value<int> id,
  required int farmerId,
  required double amount,
  required String type,
  required String date,
  Value<bool> isSynced,
});
typedef $$VSLATransactionsTableUpdateCompanionBuilder
    = VSLATransactionsCompanion Function({
  Value<int> id,
  Value<int> farmerId,
  Value<double> amount,
  Value<String> type,
  Value<String> date,
  Value<bool> isSynced,
});

final class $$VSLATransactionsTableReferences extends BaseReferences<
    _$AppDatabase, $VSLATransactionsTable, VSLATransaction> {
  $$VSLATransactionsTableReferences(
      super.$_db, super.$_table, super.$_typedResult);

  static $FarmersTable _farmerIdTable(_$AppDatabase db) =>
      db.farmers.createAlias(
          $_aliasNameGenerator(db.vSLATransactions.farmerId, db.farmers.id));

  $$FarmersTableProcessedTableManager get farmerId {
    final $_column = $_itemColumn<int>('farmer_id')!;

    final manager = $$FarmersTableTableManager($_db, $_db.farmers)
        .filter((f) => f.id.sqlEquals($_column));
    final item = $_typedResult.readTableOrNull(_farmerIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$VSLATransactionsTableFilterComposer
    extends Composer<_$AppDatabase, $VSLATransactionsTable> {
  $$VSLATransactionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnFilters(column));

  $$FarmersTableFilterComposer get farmerId {
    final $$FarmersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableFilterComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$VSLATransactionsTableOrderingComposer
    extends Composer<_$AppDatabase, $VSLATransactionsTable> {
  $$VSLATransactionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get amount => $composableBuilder(
      column: $table.amount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get date => $composableBuilder(
      column: $table.date, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isSynced => $composableBuilder(
      column: $table.isSynced, builder: (column) => ColumnOrderings(column));

  $$FarmersTableOrderingComposer get farmerId {
    final $$FarmersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableOrderingComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$VSLATransactionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $VSLATransactionsTable> {
  $$VSLATransactionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<double> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get date =>
      $composableBuilder(column: $table.date, builder: (column) => column);

  GeneratedColumn<bool> get isSynced =>
      $composableBuilder(column: $table.isSynced, builder: (column) => column);

  $$FarmersTableAnnotationComposer get farmerId {
    final $$FarmersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.farmerId,
        referencedTable: $db.farmers,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$FarmersTableAnnotationComposer(
              $db: $db,
              $table: $db.farmers,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$VSLATransactionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $VSLATransactionsTable,
    VSLATransaction,
    $$VSLATransactionsTableFilterComposer,
    $$VSLATransactionsTableOrderingComposer,
    $$VSLATransactionsTableAnnotationComposer,
    $$VSLATransactionsTableCreateCompanionBuilder,
    $$VSLATransactionsTableUpdateCompanionBuilder,
    (VSLATransaction, $$VSLATransactionsTableReferences),
    VSLATransaction,
    PrefetchHooks Function({bool farmerId})> {
  $$VSLATransactionsTableTableManager(
      _$AppDatabase db, $VSLATransactionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$VSLATransactionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$VSLATransactionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$VSLATransactionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> farmerId = const Value.absent(),
            Value<double> amount = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String> date = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
          }) =>
              VSLATransactionsCompanion(
            id: id,
            farmerId: farmerId,
            amount: amount,
            type: type,
            date: date,
            isSynced: isSynced,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int farmerId,
            required double amount,
            required String type,
            required String date,
            Value<bool> isSynced = const Value.absent(),
          }) =>
              VSLATransactionsCompanion.insert(
            id: id,
            farmerId: farmerId,
            amount: amount,
            type: type,
            date: date,
            isSynced: isSynced,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$VSLATransactionsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({farmerId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (farmerId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.farmerId,
                    referencedTable:
                        $$VSLATransactionsTableReferences._farmerIdTable(db),
                    referencedColumn:
                        $$VSLATransactionsTableReferences._farmerIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$VSLATransactionsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $VSLATransactionsTable,
    VSLATransaction,
    $$VSLATransactionsTableFilterComposer,
    $$VSLATransactionsTableOrderingComposer,
    $$VSLATransactionsTableAnnotationComposer,
    $$VSLATransactionsTableCreateCompanionBuilder,
    $$VSLATransactionsTableUpdateCompanionBuilder,
    (VSLATransaction, $$VSLATransactionsTableReferences),
    VSLATransaction,
    PrefetchHooks Function({bool farmerId})>;
typedef $$SyncInfoTableCreateCompanionBuilder = SyncInfoCompanion Function({
  Value<int> id,
  required String entity,
  required String lastSync,
});
typedef $$SyncInfoTableUpdateCompanionBuilder = SyncInfoCompanion Function({
  Value<int> id,
  Value<String> entity,
  Value<String> lastSync,
});

class $$SyncInfoTableFilterComposer
    extends Composer<_$AppDatabase, $SyncInfoTable> {
  $$SyncInfoTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get entity => $composableBuilder(
      column: $table.entity, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastSync => $composableBuilder(
      column: $table.lastSync, builder: (column) => ColumnFilters(column));
}

class $$SyncInfoTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncInfoTable> {
  $$SyncInfoTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get entity => $composableBuilder(
      column: $table.entity, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastSync => $composableBuilder(
      column: $table.lastSync, builder: (column) => ColumnOrderings(column));
}

class $$SyncInfoTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncInfoTable> {
  $$SyncInfoTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get entity =>
      $composableBuilder(column: $table.entity, builder: (column) => column);

  GeneratedColumn<String> get lastSync =>
      $composableBuilder(column: $table.lastSync, builder: (column) => column);
}

class $$SyncInfoTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SyncInfoTable,
    SyncInfoData,
    $$SyncInfoTableFilterComposer,
    $$SyncInfoTableOrderingComposer,
    $$SyncInfoTableAnnotationComposer,
    $$SyncInfoTableCreateCompanionBuilder,
    $$SyncInfoTableUpdateCompanionBuilder,
    (SyncInfoData, BaseReferences<_$AppDatabase, $SyncInfoTable, SyncInfoData>),
    SyncInfoData,
    PrefetchHooks Function()> {
  $$SyncInfoTableTableManager(_$AppDatabase db, $SyncInfoTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncInfoTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncInfoTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncInfoTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> entity = const Value.absent(),
            Value<String> lastSync = const Value.absent(),
          }) =>
              SyncInfoCompanion(
            id: id,
            entity: entity,
            lastSync: lastSync,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String entity,
            required String lastSync,
          }) =>
              SyncInfoCompanion.insert(
            id: id,
            entity: entity,
            lastSync: lastSync,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SyncInfoTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SyncInfoTable,
    SyncInfoData,
    $$SyncInfoTableFilterComposer,
    $$SyncInfoTableOrderingComposer,
    $$SyncInfoTableAnnotationComposer,
    $$SyncInfoTableCreateCompanionBuilder,
    $$SyncInfoTableUpdateCompanionBuilder,
    (SyncInfoData, BaseReferences<_$AppDatabase, $SyncInfoTable, SyncInfoData>),
    SyncInfoData,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$FarmersTableTableManager get farmers =>
      $$FarmersTableTableManager(_db, _db.farmers);
  $$SalesTableTableManager get sales =>
      $$SalesTableTableManager(_db, _db.sales);
  $$TrainingsTableTableManager get trainings =>
      $$TrainingsTableTableManager(_db, _db.trainings);
  $$AttendanceTableTableManager get attendance =>
      $$AttendanceTableTableManager(_db, _db.attendance);
  $$VSLATransactionsTableTableManager get vSLATransactions =>
      $$VSLATransactionsTableTableManager(_db, _db.vSLATransactions);
  $$SyncInfoTableTableManager get syncInfo =>
      $$SyncInfoTableTableManager(_db, _db.syncInfo);
}
