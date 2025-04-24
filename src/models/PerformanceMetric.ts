export interface MemberMetric {
    name?: string;
    issueCount: number;

    commitedPoints: number;
    completedPoints: number;

    commitedPointsPerDay: number;
    completedPointsPerDay: number;

    newFeaturePoints: number;
    backlogBugPoints: number;

    maxTaskPoint: number;
    avgTaskPoint: number;

    // Actual vs Estimate ratio
    newFeatureActualSum: number;
    newFeatureEstimateSum: number;
    backlogBugActualSum: number;
    backlogBugEstimateSum: number;
    newFeatureActEst: number;
    backlogBugActEst: number;

    newBugCount: number;
    newBugCountPerPoint: number;
}