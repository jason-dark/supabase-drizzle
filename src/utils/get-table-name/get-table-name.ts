const getTableName = <T>(table: T) => String(table[Symbol.for('drizzle:Name') as keyof T]);

export { getTableName };
