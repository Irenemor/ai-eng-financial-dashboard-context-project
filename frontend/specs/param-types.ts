import type {
  BusinessType,
  OperationType,
} from '../src/lib/financial-types'

export interface DateRangeFilter {
  /** Date serialized as YYYY-MM-DD. */
  start_date?: string
  /** Date serialized as YYYY-MM-DD. */
  end_date?: string
}

export interface AlertsParams extends DateRangeFilter {
  /** Optional query parameter; defaults to 0.3 and has a current minimum of 0. */
  threshold?: number
  group_by?: 'day' | 'week' | 'month'
  business_type?: BusinessType
}

export interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: OperationType
  /** Optional integer from 1 to 20; defaults to 5. */
  limit?: number
  /** Optional in the API; set to B2B or B2C for the comparison view. */
  business_type?: BusinessType
}