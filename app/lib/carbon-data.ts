export type CarbonScope = "scope1" | "scope2" | "scope3";

export type SourceActivityRow = {
  id: number;
  sourceSheet: string;
  sourceRowNumber: number;
  activityDate: string;
  activityType: string;
  description: string;
  quantity: number;
  unit: string;
  productName: string;
};

export type EmissionFactor = {
  id: string;
  activityType: string;
  descriptionMatcher: string | null;
  unit: string;
  scope: CarbonScope;
  factor: number;
  factorUnit: string;
  source: string;
  validFrom: string;
  validTo: string | null;
};

export type CarbonActivity = {
  id: number;
  sourceRowNumber: number | null;
  activityDate: string;
  scope: CarbonScope;
  activityType: string;
  description: string;
  quantity: number;
  unit: string;
  amountLabel: string;
  emissionFactorId: string | null;
  emissionFactor: number;
  emissionKgCo2e: number;
  facilityName: string;
  productName: string;
  supplierName: string | null;
};

export const sourceActivityRows: SourceActivityRow[] = [
  {
    id: 1,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 4,
    activityDate: "2025-01-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 110,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 2,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 5,
    activityDate: "2025-02-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 112,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 3,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 6,
    activityDate: "2025-03-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 115,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 4,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 7,
    activityDate: "2025-04-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 130,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 5,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 8,
    activityDate: "2025-05-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 120,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 6,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 9,
    activityDate: "2025-06-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 110,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 7,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 10,
    activityDate: "2025-07-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 120,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 8,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 11,
    activityDate: "2025-08-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 111,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 9,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 12,
    activityDate: "2025-05-01",
    activityType: "전기",
    description: "한국전력",
    quantity: 101,
    unit: "kWh",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 10,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 13,
    activityDate: "2025-01-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 230,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 11,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 14,
    activityDate: "2025-02-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 340,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 12,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 15,
    activityDate: "2025-03-01",
    activityType: "원소재",
    description: "플라스틱 2",
    quantity: 23,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 13,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 16,
    activityDate: "2025-03-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 430,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 14,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 17,
    activityDate: "2025-04-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 510,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 15,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 18,
    activityDate: "2025-05-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 424,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 16,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 19,
    activityDate: "2025-05-01",
    activityType: "원소재",
    description: "플라스틱 2",
    quantity: 40,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 17,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 20,
    activityDate: "2025-06-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 450,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 18,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 21,
    activityDate: "2025-07-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 340,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 19,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 22,
    activityDate: "2025-07-01",
    activityType: "원소재",
    description: "플라스틱 2",
    quantity: 43,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 20,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 23,
    activityDate: "2025-08-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 230,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 21,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 24,
    activityDate: "2025-05-01",
    activityType: "원소재",
    description: "플라스틱 1",
    quantity: 232,
    unit: "kg",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 22,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 25,
    activityDate: "2025-01-01",
    activityType: "운송",
    description: "트럭",
    quantity: 41,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 23,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 26,
    activityDate: "2025-02-01",
    activityType: "운송",
    description: "트럭",
    quantity: 211,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 24,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 27,
    activityDate: "2025-03-01",
    activityType: "운송",
    description: "트럭",
    quantity: 123,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 25,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 28,
    activityDate: "2025-04-01",
    activityType: "운송",
    description: "트럭",
    quantity: 42,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 26,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 29,
    activityDate: "2025-05-01",
    activityType: "운송",
    description: "트럭",
    quantity: 123,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 27,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 30,
    activityDate: "2025-06-01",
    activityType: "운송",
    description: "트럭",
    quantity: 123,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 28,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 31,
    activityDate: "2025-07-01",
    activityType: "운송",
    description: "트럭",
    quantity: 41,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 29,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 32,
    activityDate: "2025-08-01",
    activityType: "운송",
    description: "트럭",
    quantity: 123,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
  {
    id: 30,
    sourceSheet: "과제용 데이터",
    sourceRowNumber: 33,
    activityDate: "2025-05-01",
    activityType: "운송",
    description: "트럭",
    quantity: 12,
    unit: "ton-km",
    productName: "컴퓨터 화면 (CT-045)",
  },
];

export const emissionFactors: EmissionFactor[] = [
  {
    id: "ef-electric-kepco-2025",
    activityType: "전기",
    descriptionMatcher: "한국전력",
    unit: "kWh",
    scope: "scope2",
    factor: 0.456,
    factorUnit: "kgCO2e / kWh",
    source: "과제용 데이터 H5:J5",
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: "ef-material-plastic-1-2025",
    activityType: "원소재",
    descriptionMatcher: "플라스틱 1",
    unit: "kg",
    scope: "scope3",
    factor: 2.3,
    factorUnit: "kgCO2e / kg",
    source: "과제용 데이터 H6:J6",
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: "ef-material-plastic-2-2025",
    activityType: "원소재",
    descriptionMatcher: "플라스틱 2",
    unit: "kg",
    scope: "scope3",
    factor: 3.2,
    factorUnit: "kgCO2e / kg",
    source: "과제용 데이터 H7:J7",
    validFrom: "2025-01-01",
    validTo: null,
  },
  {
    id: "ef-transport-truck-2025",
    activityType: "운송",
    descriptionMatcher: "트럭",
    unit: "ton-km",
    scope: "scope3",
    factor: 3.5,
    factorUnit: "kgCO2e / ton-km",
    source: "과제용 데이터 H8:J8",
    validFrom: "2025-01-01",
    validTo: null,
  },
];

export function resolveEmissionFactor(row: SourceActivityRow) {
  return emissionFactors.find((factor) => {
    const matchesType = factor.activityType === row.activityType;
    const matchesUnit = factor.unit === row.unit;
    const matchesDescription =
      factor.descriptionMatcher === null ||
      row.description.includes(factor.descriptionMatcher);

    return matchesType && matchesUnit && matchesDescription;
  });
}

export function calculateCarbonActivity(row: SourceActivityRow): CarbonActivity {
  const factor = resolveEmissionFactor(row);

  if (!factor) {
    throw new Error(
      `배출계수를 찾을 수 없습니다: ${row.activityType} / ${row.description} / ${row.unit}`,
    );
  }

  return {
    id: row.id,
    sourceRowNumber: row.sourceRowNumber,
    activityDate: row.activityDate,
    scope: factor.scope,
    activityType: row.activityType,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    amountLabel: `${row.quantity.toLocaleString("ko-KR")} ${row.unit}`,
    emissionFactorId: factor.id,
    emissionFactor: factor.factor,
    emissionKgCo2e: Number((row.quantity * factor.factor).toFixed(3)),
    facilityName: "미지정",
    productName: row.productName,
    supplierName: row.activityType === "전기" ? row.description : null,
  };
}

export async function getCarbonActivities() {
  return sourceActivityRows.map(calculateCarbonActivity);
}
