import { QueryState, FilterCondition, ProjectionField, SortField } from './types';
import { escapeGroqString, escapeFieldName } from "../utils/escaping"

export class GroqGenerator {
    static generate(state: QueryState): string {
        const parts: string[] = [];

        // Base query start
        if (state.type) {
            parts.push(`*[_type == "${state.type}"`);
        } else {
            parts.push('*[');
        }

        // Add filters
        if (state.filters && state.filters?.length > 0) {
            const filterString = this.generateFilters(state.filters);
            if (state.type) {
                parts[0] += ` && ${filterString}`;
            } else {
                parts[0] += filterString;
            }
        }
        parts[0] += ']';

        // Add sorting
        if (state.sorts.length > 0) {
            parts.push(this.generateSorting(state.sorts));
        }

        // Add slicing/pagination
        if (state.slice) {
            parts.push(`[${state.slice[0]}...${state.slice[1]}]`);
        } else if (state.offset !== undefined || state.limit !== undefined) {
            const start = state.offset || 0;
            const end = state.limit ? start + state.limit : '';
            parts.push(`[${start}...${end}]`);
        }

        // Add projections
        if (state.projections.length > 0) {
            parts.push(this.generateProjections(state.projections));
        }

        return parts.join(' ');
    }

    private static generateFilters(filters: FilterCondition[]): string {
        return filters.map(filter => this.generateFilter(filter)).join(' && ');
    }

    private static generateFilter(filter: FilterCondition): string {
        const field = escapeFieldName(filter.field);
        const { operator, value } = filter;

        switch (operator) {
            case 'eq':
                return `${field} == ${this.formatValue(value)}`;
            case 'neq':
                return `${field} != ${this.formatValue(value)}`;
            case 'gt':
                return `${field} > ${this.formatValue(value)}`;
            case 'gte':
                return `${field} >= ${this.formatValue(value)}`;
            case 'lt':
                return `${field} < ${this.formatValue(value)}`;
            case 'lte':
                return `${field} <= ${this.formatValue(value)}`;
            case 'in':
                return `${field} in ${this.formatArray(value)}`;
            case 'nin':
                return `!(${field} in ${this.formatArray(value)})`;
            case 'match':
                return `${field} match ${this.formatValue(value)}`;
            case 'contains':
                return `${field} match "*${escapeGroqString(value)}*"`;
            case 'exists':
                return `defined(${field})`;
            case 'not_exists':
                return `!defined(${field})`;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    private static generateSorting(sorts: SortField[]): string {
        const sortStrings = sorts.map(sort => {
            const direction = sort.direction === 'desc' ? 'desc' : 'asc';
            return `${escapeFieldName(sort.field)} ${direction}`;
        });
        return `| order(${sortStrings.join(', ')})`;
    }

    private static generateProjections(projections: ProjectionField[]): string {
        const projectStrings = projections.map(proj=> this.generateProjection(proj));
        return `| ${projectStrings.join(', ')}`;
    }

    private static generateProjection(projection: ProjectionField): string {
        let result = escapeFieldName(projection.name);

        if(projection.nested && projection.nested.length > 0) {
            const nestedProjections = projection.nested.map(p => this.generateProjection(p));
            result += `{ ${nestedProjections.join(', ')} }`;
        }

        if(projection.alias){
            result = `"${projection.alias}": ${result}`;
        }

        return result;
    }

    private static formatValue(value: any): string {
        if (typeof value === 'string') {
            return `"${escapeGroqString(value)}"`;
        } else if (Array.isArray(value)) {
            return this.formatArray(value);
        } else if (value === null) {
            return 'null';
        }
        return String(value);
    }
    private static formatArray(values: any[]): string {
        const formattedItems = values.map(item => this.formatValue(item));
        return `[${formattedItems.join(', ')}]`;
    }
}