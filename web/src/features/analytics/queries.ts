import { graphql } from '@/gql'

export const ANALYTICS = graphql(`
  query Analytics($filter: EmployeeFilterInput, $bucketUsd: Int) {
    analytics(filter: $filter) {
      summary { headcount totalPayrollUsd averageUsd medianUsd }
      byDepartment { key label headcount totalUsd averageUsd medianUsd }
      byCountry { key label headcount totalUsd averageUsd medianUsd }
      byLevel { key label headcount medianUsd p25Usd p75Usd minUsd maxUsd }
      byGender { key label headcount medianUsd }
      salaryDistribution(bucketUsd: $bucketUsd) { lowerUsd upperUsd headcount }
      payByGenderAndLevel { level gender headcount medianUsd }
    }
  }
`)
