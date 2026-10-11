/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Analytics($filter: EmployeeFilterInput, $bucketUsd: Int) {\n    analytics(filter: $filter) {\n      summary { headcount totalPayrollUsd averageUsd medianUsd }\n      byDepartment { key label headcount totalUsd averageUsd medianUsd }\n      byCountry { key label headcount totalUsd averageUsd medianUsd }\n      byLevel { key label headcount medianUsd p25Usd p75Usd minUsd maxUsd }\n      byGender { key label headcount medianUsd }\n      salaryDistribution(bucketUsd: $bucketUsd) { lowerUsd upperUsd headcount }\n      payByGenderAndLevel { level gender headcount medianUsd }\n    }\n  }\n": typeof types.AnalyticsDocument,
    "\n  query FilterOptions {\n    filterOptions {\n      departments\n      levels\n      currencies\n      salaryReasons\n      countries { code name currency }\n    }\n  }\n": typeof types.FilterOptionsDocument,
    "\n  query Employees($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {\n    employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {\n      totalCount\n      page\n      perPage\n      totalPages\n      nodes {\n        id\n        employeeCode\n        fullName\n        email\n        department\n        jobTitle\n        level\n        status\n        hiredOn\n        country { code name }\n        currentSalary { id amount currency amountUsd }\n      }\n    }\n  }\n": typeof types.EmployeesDocument,
    "\n  query Employee($id: ID!) {\n    employee(id: $id) {\n      id\n      employeeCode\n      firstName\n      lastName\n      fullName\n      email\n      department\n      jobTitle\n      level\n      gender\n      status\n      hiredOn\n      terminatedOn\n      updatedAt\n      country { code name currency }\n      currentSalary { id amount currency amountUsd effectiveFrom reason }\n      salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n    }\n  }\n": typeof types.EmployeeDocument,
    "\n  mutation CreateEmployee($input: CreateEmployeeInput!) {\n    createEmployee(input: $input) {\n      employee { id fullName }\n      errors { path message }\n    }\n  }\n": typeof types.CreateEmployeeDocument,
    "\n  mutation UpdateEmployee($input: UpdateEmployeeInput!) {\n    updateEmployee(input: $input) {\n      employee {\n        id\n        firstName\n        lastName\n        fullName\n        email\n        department\n        jobTitle\n        level\n        gender\n        status\n        hiredOn\n        terminatedOn\n        updatedAt\n        country { code name currency }\n      }\n      errors { path message }\n    }\n  }\n": typeof types.UpdateEmployeeDocument,
    "\n  mutation AdjustSalary($input: AdjustSalaryInput!) {\n    adjustSalary(input: $input) {\n      salaryRecord { id }\n      employee {\n        id\n        currentSalary { id amount currency amountUsd effectiveFrom reason }\n        salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n      }\n      errors { path message }\n    }\n  }\n": typeof types.AdjustSalaryDocument,
};
const documents: Documents = {
    "\n  query Analytics($filter: EmployeeFilterInput, $bucketUsd: Int) {\n    analytics(filter: $filter) {\n      summary { headcount totalPayrollUsd averageUsd medianUsd }\n      byDepartment { key label headcount totalUsd averageUsd medianUsd }\n      byCountry { key label headcount totalUsd averageUsd medianUsd }\n      byLevel { key label headcount medianUsd p25Usd p75Usd minUsd maxUsd }\n      byGender { key label headcount medianUsd }\n      salaryDistribution(bucketUsd: $bucketUsd) { lowerUsd upperUsd headcount }\n      payByGenderAndLevel { level gender headcount medianUsd }\n    }\n  }\n": types.AnalyticsDocument,
    "\n  query FilterOptions {\n    filterOptions {\n      departments\n      levels\n      currencies\n      salaryReasons\n      countries { code name currency }\n    }\n  }\n": types.FilterOptionsDocument,
    "\n  query Employees($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {\n    employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {\n      totalCount\n      page\n      perPage\n      totalPages\n      nodes {\n        id\n        employeeCode\n        fullName\n        email\n        department\n        jobTitle\n        level\n        status\n        hiredOn\n        country { code name }\n        currentSalary { id amount currency amountUsd }\n      }\n    }\n  }\n": types.EmployeesDocument,
    "\n  query Employee($id: ID!) {\n    employee(id: $id) {\n      id\n      employeeCode\n      firstName\n      lastName\n      fullName\n      email\n      department\n      jobTitle\n      level\n      gender\n      status\n      hiredOn\n      terminatedOn\n      updatedAt\n      country { code name currency }\n      currentSalary { id amount currency amountUsd effectiveFrom reason }\n      salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n    }\n  }\n": types.EmployeeDocument,
    "\n  mutation CreateEmployee($input: CreateEmployeeInput!) {\n    createEmployee(input: $input) {\n      employee { id fullName }\n      errors { path message }\n    }\n  }\n": types.CreateEmployeeDocument,
    "\n  mutation UpdateEmployee($input: UpdateEmployeeInput!) {\n    updateEmployee(input: $input) {\n      employee {\n        id\n        firstName\n        lastName\n        fullName\n        email\n        department\n        jobTitle\n        level\n        gender\n        status\n        hiredOn\n        terminatedOn\n        updatedAt\n        country { code name currency }\n      }\n      errors { path message }\n    }\n  }\n": types.UpdateEmployeeDocument,
    "\n  mutation AdjustSalary($input: AdjustSalaryInput!) {\n    adjustSalary(input: $input) {\n      salaryRecord { id }\n      employee {\n        id\n        currentSalary { id amount currency amountUsd effectiveFrom reason }\n        salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n      }\n      errors { path message }\n    }\n  }\n": types.AdjustSalaryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Analytics($filter: EmployeeFilterInput, $bucketUsd: Int) {\n    analytics(filter: $filter) {\n      summary { headcount totalPayrollUsd averageUsd medianUsd }\n      byDepartment { key label headcount totalUsd averageUsd medianUsd }\n      byCountry { key label headcount totalUsd averageUsd medianUsd }\n      byLevel { key label headcount medianUsd p25Usd p75Usd minUsd maxUsd }\n      byGender { key label headcount medianUsd }\n      salaryDistribution(bucketUsd: $bucketUsd) { lowerUsd upperUsd headcount }\n      payByGenderAndLevel { level gender headcount medianUsd }\n    }\n  }\n"): (typeof documents)["\n  query Analytics($filter: EmployeeFilterInput, $bucketUsd: Int) {\n    analytics(filter: $filter) {\n      summary { headcount totalPayrollUsd averageUsd medianUsd }\n      byDepartment { key label headcount totalUsd averageUsd medianUsd }\n      byCountry { key label headcount totalUsd averageUsd medianUsd }\n      byLevel { key label headcount medianUsd p25Usd p75Usd minUsd maxUsd }\n      byGender { key label headcount medianUsd }\n      salaryDistribution(bucketUsd: $bucketUsd) { lowerUsd upperUsd headcount }\n      payByGenderAndLevel { level gender headcount medianUsd }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FilterOptions {\n    filterOptions {\n      departments\n      levels\n      currencies\n      salaryReasons\n      countries { code name currency }\n    }\n  }\n"): (typeof documents)["\n  query FilterOptions {\n    filterOptions {\n      departments\n      levels\n      currencies\n      salaryReasons\n      countries { code name currency }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Employees($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {\n    employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {\n      totalCount\n      page\n      perPage\n      totalPages\n      nodes {\n        id\n        employeeCode\n        fullName\n        email\n        department\n        jobTitle\n        level\n        status\n        hiredOn\n        country { code name }\n        currentSalary { id amount currency amountUsd }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Employees($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {\n    employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {\n      totalCount\n      page\n      perPage\n      totalPages\n      nodes {\n        id\n        employeeCode\n        fullName\n        email\n        department\n        jobTitle\n        level\n        status\n        hiredOn\n        country { code name }\n        currentSalary { id amount currency amountUsd }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Employee($id: ID!) {\n    employee(id: $id) {\n      id\n      employeeCode\n      firstName\n      lastName\n      fullName\n      email\n      department\n      jobTitle\n      level\n      gender\n      status\n      hiredOn\n      terminatedOn\n      updatedAt\n      country { code name currency }\n      currentSalary { id amount currency amountUsd effectiveFrom reason }\n      salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n    }\n  }\n"): (typeof documents)["\n  query Employee($id: ID!) {\n    employee(id: $id) {\n      id\n      employeeCode\n      firstName\n      lastName\n      fullName\n      email\n      department\n      jobTitle\n      level\n      gender\n      status\n      hiredOn\n      terminatedOn\n      updatedAt\n      country { code name currency }\n      currentSalary { id amount currency amountUsd effectiveFrom reason }\n      salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEmployee($input: CreateEmployeeInput!) {\n    createEmployee(input: $input) {\n      employee { id fullName }\n      errors { path message }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEmployee($input: CreateEmployeeInput!) {\n    createEmployee(input: $input) {\n      employee { id fullName }\n      errors { path message }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateEmployee($input: UpdateEmployeeInput!) {\n    updateEmployee(input: $input) {\n      employee {\n        id\n        firstName\n        lastName\n        fullName\n        email\n        department\n        jobTitle\n        level\n        gender\n        status\n        hiredOn\n        terminatedOn\n        updatedAt\n        country { code name currency }\n      }\n      errors { path message }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateEmployee($input: UpdateEmployeeInput!) {\n    updateEmployee(input: $input) {\n      employee {\n        id\n        firstName\n        lastName\n        fullName\n        email\n        department\n        jobTitle\n        level\n        gender\n        status\n        hiredOn\n        terminatedOn\n        updatedAt\n        country { code name currency }\n      }\n      errors { path message }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustSalary($input: AdjustSalaryInput!) {\n    adjustSalary(input: $input) {\n      salaryRecord { id }\n      employee {\n        id\n        currentSalary { id amount currency amountUsd effectiveFrom reason }\n        salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n      }\n      errors { path message }\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustSalary($input: AdjustSalaryInput!) {\n    adjustSalary(input: $input) {\n      salaryRecord { id }\n      employee {\n        id\n        currentSalary { id amount currency amountUsd effectiveFrom reason }\n        salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }\n      }\n      errors { path message }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;