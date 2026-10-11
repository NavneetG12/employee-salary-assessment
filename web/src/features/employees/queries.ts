import { graphql } from '@/gql'

export const FILTER_OPTIONS = graphql(`
  query FilterOptions {
    filterOptions {
      departments
      levels
      currencies
      salaryReasons
      countries { code name currency }
    }
  }
`)

export const EMPLOYEES = graphql(`
  query Employees($filter: EmployeeFilterInput, $sortBy: EmployeeSortFieldEnum, $sortDirection: SortDirectionEnum, $page: Int, $perPage: Int) {
    employees(filter: $filter, sortBy: $sortBy, sortDirection: $sortDirection, page: $page, perPage: $perPage) {
      totalCount
      page
      perPage
      totalPages
      nodes {
        id
        employeeCode
        fullName
        email
        department
        jobTitle
        level
        status
        hiredOn
        country { code name }
        currentSalary { id amount currency amountUsd }
      }
    }
  }
`)

export const EMPLOYEE = graphql(`
  query Employee($id: ID!) {
    employee(id: $id) {
      id
      employeeCode
      firstName
      lastName
      fullName
      email
      department
      jobTitle
      level
      gender
      status
      hiredOn
      terminatedOn
      updatedAt
      country { code name currency }
      currentSalary { id amount currency amountUsd effectiveFrom reason }
      salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }
    }
  }
`)

export const CREATE_EMPLOYEE = graphql(`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      employee { id fullName }
      errors { path message }
    }
  }
`)

export const UPDATE_EMPLOYEE = graphql(`
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
      employee {
        id
        firstName
        lastName
        fullName
        email
        department
        jobTitle
        level
        gender
        status
        hiredOn
        terminatedOn
        updatedAt
        country { code name currency }
      }
      errors { path message }
    }
  }
`)

export const ADJUST_SALARY = graphql(`
  mutation AdjustSalary($input: AdjustSalaryInput!) {
    adjustSalary(input: $input) {
      salaryRecord { id }
      employee {
        id
        currentSalary { id amount currency amountUsd effectiveFrom reason }
        salaryHistory { id amount currency amountUsd effectiveFrom effectiveTo reason note current createdAt }
      }
      errors { path message }
    }
  }
`)
