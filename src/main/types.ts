export interface QueryOptions{
    validate?: boolean;
    cache?: boolean;
}

export interface FilterCondition {
    field: string;
    operator: FilterOperator;
    value: any;
}

export type FilterOperator = 
| 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'match' | 'contains' | 'exists' | 'not_exists';

export interface ProjectionField {
    name: string;
    alias?: string;
    nested?: ProjectionField[];
}

export interface SortField{
    field: string;
    direction?: 'asc' | 'desc';
}

export interface QueryState {
    type?: string;
    filters?: FilterCondition[];
    projections: ProjectionField[];
    sorts: SortField[];
    limit?: number;
    offset?: number;
    slice?: [number, number];
} 