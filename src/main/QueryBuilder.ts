import { FilterOperator, QueryOptions, QueryState } from "./types"

export class QueryBuilder {
    private state: QueryState = {
        filters: [],
        projections: [],
        sorts: [],
    }

    private options: QueryOptions;

    constructor(options: QueryOptions = {}) {
        this.options = {
            validate: true,
            cache: false,
            ...options
        };
    }

    from (type: string): this{
        this.state.type = type;
        return this;
    }

    where(field: string, operator: FilterOperator, value: any): this {
        if (!this.state.filters) {
            this.state.filters = [];
        }
        this.state.filters.push({ field, operator, value });
        return this;
    }

    select(...fields: string[]) : this{
        const projections = fields.map(field => ({
            name: field
        }));
        this.state.projections.push(...projections);
        return this;
    }

    selectAs(field: string, alias: string): this{
        this.state.projections.push({name: field, alias});
        return this;
    }

    whereEquals(field: string, value: any): this{
        return this.where(field, 'eq', value);
    }

    whereNotEquals(field: string, value: any) : this{
        return this.where(field, "neq", value);
    }

    whereIn(field: string, values: any[]): this{
        return this.where(field, 'in', values);
    }
    whereContains(field: string, value: string): this{
        return this.where(field, "contains", value);
    }

    whereExists(field: string): this{
        return this.where(field, "exists", true);
    }

    whereNotExists(field: string): this{
        return this.where(field, "not_exists", true);
    }

    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
        this.state.sorts.push({ field, direction });
        return this;
    }

    orderByAsc(field: string): this{
        return this.orderBy(field, 'asc');
    }

    orderByDesc(field: string): this{
        return this.orderBy(field, 'desc');
    }

    limit(count: number): this {
        this.state.limit = count;
        return this;
    }
    offset(count: number): this {
        this.state.offset = count;
        return this;
    }
    slice(start: number, end: number): this {
        this.state.slice = [start, end];
        return this;
    }

    and(): QueryBuilder{
        const newBuilder = new QueryBuilder(this.options);
        newBuilder.state = {...this.state};
        return newBuilder;
    }

    or(): QueryBuilder {
        // Complex logic needed here
        return this;
    }

    build(): QueryState {
        if (this.options.validate) {
            // Validatation logic can be added here
        }
        return this.state;
    }
}
