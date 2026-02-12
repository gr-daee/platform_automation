import { executeQuery } from '../db-helper';

/**
 * TestDataLocator - Cache and provide stable test data
 * 
 * Purpose: Provide reusable, stable data for tests without hardcoding IDs.
 * All data is cached for performance (cleared between test runs).
 * 
 * Pattern: Query for stable data NOT created by tests (excludes AUTO_QA_ prefix)
 * 
 * @example
 * const dealer = await TestDataLocator.getStableDealer();
 * const product = await TestDataLocator.getStableProduct('Electronics');
 * const user = await TestDataLocator.getStableUser('manager');
 */
export class TestDataLocator {
  private static cache: Map<string, any> = new Map();

  /**
   * Clear all cached data
   * Call this in test teardown or between test runs
   * 
   * @example
   * afterAll(() => {
   *   TestDataLocator.clearCache();
   * });
   */
  static clearCache(): void {
    this.cache.clear();
    console.log('✅ TestDataLocator cache cleared');
  }

  /**
   * Get cache key for specific query
   */
  private static getCacheKey(prefix: string, params?: any): string {
    return params ? `${prefix}_${JSON.stringify(params)}` : prefix;
  }

  // ==========================================
  // Dealer Data
  // ==========================================

  /**
   * Get a stable dealer (not test data)
   * Returns the most recently created active dealer
   * 
   * @param tenant - Optional tenant filter (e.g., 'IACS', 'Demo Tenant')
   * @returns Dealer object with id, name, gstin, tenant info, etc.
   * 
   * @example
   * const dealer = await TestDataLocator.getStableDealer();
   * const iacsDealer = await TestDataLocator.getStableDealer('IACS');
   * await ordersPage.selectDealer(dealer.name);
   */
  static async getStableDealer(tenant?: string): Promise<any> {
    const cacheKey = this.getCacheKey('dealer', { tenant });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT d.id, d.name, d.gstin, d.email, d.phone, d.status, 
               t.id as tenant_id, t.name as tenant_name
        FROM dealers d
        LEFT JOIN tenants t ON d.tenant_id = t.id
        WHERE d.status = 'active'
          AND d.name NOT LIKE 'AUTO_QA_%'
      `;
      const params: any[] = [];
      
      if (tenant) {
        query += ` AND t.name = $1`;
        params.push(tenant);
      }
      
      query += ` ORDER BY d.created_at DESC LIMIT 10`;
      
      const dealers = await executeQuery(query, params);
      
      if (dealers.length === 0) {
        const tenantMsg = tenant ? ` for tenant '${tenant}'` : '';
        throw new Error(`No stable dealer found${tenantMsg}. Please ensure at least one active dealer exists.`);
      }
      
      this.cache.set(cacheKey, dealers);
      console.log(`✅ Cached ${dealers.length} stable dealers${tenant ? ` (tenant: ${tenant})` : ''}`);
    }
    
    const dealers = this.cache.get(cacheKey);
    return dealers[0]; // Return first (most recent)
  }

  /**
   * Get all stable dealers
   * 
   * @param tenant - Optional tenant filter
   * @param limit - Maximum number of dealers to return (default: 10)
   * @returns Array of dealer objects
   * 
   * @example
   * const dealers = await TestDataLocator.getStableDealers();
   * const iacsDealers = await TestDataLocator.getStableDealers('IACS', 5);
   */
  static async getStableDealers(tenant?: string, limit: number = 10): Promise<any[]> {
    const cacheKey = this.getCacheKey('dealers', { tenant, limit });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT d.id, d.name, d.gstin, d.email, d.phone, d.status,
               t.id as tenant_id, t.name as tenant_name
        FROM dealers d
        LEFT JOIN tenants t ON d.tenant_id = t.id
        WHERE d.status = 'active'
          AND d.name NOT LIKE 'AUTO_QA_%'
      `;
      const params: any[] = [];
      
      if (tenant) {
        query += ` AND t.name = $1`;
        params.push(tenant);
        query += ` ORDER BY d.created_at DESC LIMIT $2`;
        params.push(limit);
      } else {
        query += ` ORDER BY d.created_at DESC LIMIT $1`;
        params.push(limit);
      }
      
      const dealers = await executeQuery(query, params);
      
      this.cache.set(cacheKey, dealers);
      console.log(`✅ Cached ${dealers.length} stable dealers${tenant ? ` (tenant: ${tenant})` : ''}`);
    }
    
    return this.cache.get(cacheKey);
  }

  // ==========================================
  // Product Data
  // ==========================================

  /**
   * Get a stable product by category
   * Returns the most recently created active product in that category
   * 
   * @param category - Product category name
   * @returns Product object with id, name, sku, category, etc.
   * 
   * @example
   * const product = await TestDataLocator.getStableProduct('Electronics');
   * await ordersPage.addProduct(product.name, 5);
   */
  static async getStableProduct(category?: string): Promise<any> {
    const cacheKey = this.getCacheKey('product', { category });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT id, name, sku, category, price, status
        FROM products
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
      `;
      const params: any[] = [];
      
      if (category) {
        query += ` AND category = $1`;
        params.push(category);
      }
      
      query += ` ORDER BY created_at DESC LIMIT 10`;
      
      const products = await executeQuery(query, params);
      
      if (products.length === 0) {
        const categoryMsg = category ? ` in category '${category}'` : '';
        throw new Error(`No stable product found${categoryMsg}. Please ensure at least one active product exists.`);
      }
      
      this.cache.set(cacheKey, products);
      console.log(`✅ Cached ${products.length} stable products${category ? ` (${category})` : ''}`);
    }
    
    const products = this.cache.get(cacheKey);
    return products[0]; // Return first (most recent)
  }

  /**
   * Get all stable products, optionally filtered by category
   * 
   * @param category - Optional category filter
   * @param limit - Maximum number of products to return (default: 10)
   * @returns Array of product objects
   * 
   * @example
   * const products = await TestDataLocator.getStableProducts('Electronics', 5);
   */
  static async getStableProducts(category?: string, limit: number = 10): Promise<any[]> {
    const cacheKey = this.getCacheKey('products', { category, limit });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT id, name, sku, category, price, status
        FROM products
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
      `;
      const params: any[] = [];
      
      if (category) {
        query += ` AND category = $1`;
        params.push(category);
        query += ` ORDER BY created_at DESC LIMIT $2`;
        params.push(limit);
      } else {
        query += ` ORDER BY created_at DESC LIMIT $1`;
        params.push(limit);
      }
      
      const products = await executeQuery(query, params);
      
      this.cache.set(cacheKey, products);
      console.log(`✅ Cached ${products.length} stable products`);
    }
    
    return this.cache.get(cacheKey);
  }

  // ==========================================
  // Category Data
  // ==========================================

  /**
   * Get a stable category
   * 
   * @returns Category object with id, name, etc.
   * 
   * @example
   * const category = await TestDataLocator.getStableCategory();
   */
  static async getStableCategory(): Promise<any> {
    const cacheKey = this.getCacheKey('category');
    
    if (!this.cache.has(cacheKey)) {
      const categories = await executeQuery(`
        SELECT id, name, description, status
        FROM categories
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      if (categories.length === 0) {
        throw new Error('No stable category found. Please ensure at least one active category exists.');
      }
      
      this.cache.set(cacheKey, categories);
      console.log(`✅ Cached ${categories.length} stable categories`);
    }
    
    const categories = this.cache.get(cacheKey);
    return categories[0];
  }

  /**
   * Get all stable categories
   * 
   * @param limit - Maximum number of categories to return (default: 10)
   * @returns Array of category objects
   */
  static async getStableCategories(limit: number = 10): Promise<any[]> {
    const cacheKey = this.getCacheKey('categories', { limit });
    
    if (!this.cache.has(cacheKey)) {
      const categories = await executeQuery(`
        SELECT id, name, description, status
        FROM categories
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);
      
      this.cache.set(cacheKey, categories);
      console.log(`✅ Cached ${categories.length} stable categories`);
    }
    
    return this.cache.get(cacheKey);
  }

  // ==========================================
  // User Data
  // ==========================================

  /**
   * Get a stable user by role
   * Returns a user NOT created by tests
   * 
   * @param role - User role (e.g., 'admin', 'manager', 'user')
   * @returns User object with id, email, role, etc.
   * 
   * @example
   * const manager = await TestDataLocator.getStableUser('manager');
   * await ordersPage.assignTo(manager.email);
   */
  static async getStableUser(role?: string): Promise<any> {
    const cacheKey = this.getCacheKey('user', { role });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT u.id, u.email, u.created_at, u.app_metadata
        FROM auth.users u
        WHERE u.email NOT LIKE 'AUTO_QA_%@%'
      `;
      const params: any[] = [];
      
      if (role) {
        query += ` AND u.app_metadata->>'role' = $1`;
        params.push(role);
      }
      
      query += ` ORDER BY u.created_at DESC LIMIT 10`;
      
      const users = await executeQuery(query, params);
      
      if (users.length === 0) {
        const roleMsg = role ? ` with role '${role}'` : '';
        throw new Error(`No stable user found${roleMsg}. Please ensure at least one user exists.`);
      }
      
      this.cache.set(cacheKey, users);
      console.log(`✅ Cached ${users.length} stable users${role ? ` (${role})` : ''}`);
    }
    
    const users = this.cache.get(cacheKey);
    return users[0];
  }

  /**
   * Get all stable users, optionally filtered by role
   * 
   * @param role - Optional role filter
   * @param limit - Maximum number of users to return (default: 10)
   * @returns Array of user objects
   */
  static async getStableUsers(role?: string, limit: number = 10): Promise<any[]> {
    const cacheKey = this.getCacheKey('users', { role, limit });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT u.id, u.email, u.created_at, u.app_metadata
        FROM auth.users u
        WHERE u.email NOT LIKE 'AUTO_QA_%@%'
      `;
      const params: any[] = [];
      
      if (role) {
        query += ` AND u.app_metadata->>'role' = $1`;
        params.push(role);
        query += ` ORDER BY u.created_at DESC LIMIT $2`;
        params.push(limit);
      } else {
        query += ` ORDER BY u.created_at DESC LIMIT $1`;
        params.push(limit);
      }
      
      const users = await executeQuery(query, params);
      
      this.cache.set(cacheKey, users);
      console.log(`✅ Cached ${users.length} stable users`);
    }
    
    return this.cache.get(cacheKey);
  }

  // ==========================================
  // Tenant Data (Multi-Tenant Support)
  // ==========================================

  /**
   * Get a stable tenant by name
   * 
   * @param tenantName - Optional tenant name filter
   * @returns Tenant object with id, name, domain, etc.
   * 
   * @example
   * const tenant = await TestDataLocator.getStableTenant();
   * const iacsTenant = await TestDataLocator.getStableTenant('IACS');
   */
  static async getStableTenant(tenantName?: string): Promise<any> {
    const cacheKey = this.getCacheKey('tenant', { tenantName });
    
    if (!this.cache.has(cacheKey)) {
      let query = `
        SELECT id, name, domain, status
        FROM tenants
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
      `;
      const params: any[] = [];
      
      if (tenantName) {
        query += ` AND name = $1`;
        params.push(tenantName);
      }
      
      query += ` ORDER BY created_at DESC LIMIT 10`;
      
      const tenants = await executeQuery(query, params);
      
      if (tenants.length === 0) {
        const nameMsg = tenantName ? ` with name '${tenantName}'` : '';
        throw new Error(`No stable tenant found${nameMsg}. Please ensure at least one active tenant exists.`);
      }
      
      this.cache.set(cacheKey, tenants);
      console.log(`✅ Cached ${tenants.length} stable tenants${tenantName ? ` (name: ${tenantName})` : ''}`);
    }
    
    const tenants = this.cache.get(cacheKey);
    return tenants[0];
  }

  /**
   * Get all stable tenants
   * 
   * @param limit - Maximum number of tenants to return (default: 10)
   * @returns Array of tenant objects
   * 
   * @example
   * const tenants = await TestDataLocator.getStableTenants();
   */
  static async getStableTenants(limit: number = 10): Promise<any[]> {
    const cacheKey = this.getCacheKey('tenants', { limit });
    
    if (!this.cache.has(cacheKey)) {
      const tenants = await executeQuery(`
        SELECT id, name, domain, status
        FROM tenants
        WHERE status = 'active'
          AND name NOT LIKE 'AUTO_QA_%'
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);
      
      this.cache.set(cacheKey, tenants);
      console.log(`✅ Cached ${tenants.length} stable tenants`);
    }
    
    return this.cache.get(cacheKey);
  }

  // ==========================================
  // Generic Query Method
  // ==========================================

  /**
   * Execute custom query and cache results
   * Use this for module-specific stable data needs
   * 
   * @param cacheKey - Unique cache key for this query
   * @param query - SQL SELECT query
   * @param params - Query parameters
   * @returns Query results
   * 
   * @example
   * const warehouses = await TestDataLocator.queryAndCache(
   *   'warehouses',
   *   'SELECT * FROM warehouses WHERE status = $1 LIMIT 10',
   *   ['active']
   * );
   */
  static async queryAndCache(
    cacheKey: string, 
    query: string, 
    params?: any[]
  ): Promise<any[]> {
    if (!this.cache.has(cacheKey)) {
      const results = await executeQuery(query, params);
      this.cache.set(cacheKey, results);
      console.log(`✅ Cached ${results.length} results for key '${cacheKey}'`);
    }
    
    return this.cache.get(cacheKey);
  }

  /**
   * Get single item from cached query
   * 
   * @param cacheKey - Cache key
   * @param query - SQL query
   * @param params - Query parameters
   * @returns First result from query
   */
  static async queryAndCacheOne(
    cacheKey: string,
    query: string,
    params?: any[]
  ): Promise<any> {
    const results = await this.queryAndCache(cacheKey, query, params);
    
    if (results.length === 0) {
      throw new Error(`No results found for query with cache key '${cacheKey}'`);
    }
    
    return results[0];
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Check if cache has data for specific key
   * 
   * @param cacheKey - Cache key to check
   * @returns True if cached
   */
  static has(cacheKey: string): boolean {
    return this.cache.has(cacheKey);
  }

  /**
   * Get cache statistics
   * 
   * @returns Object with cache size and keys
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Invalidate specific cache key
   * 
   * @param cacheKey - Key to invalidate
   */
  static invalidate(cacheKey: string): void {
    if (this.cache.has(cacheKey)) {
      this.cache.delete(cacheKey);
      console.log(`✅ Invalidated cache for key '${cacheKey}'`);
    }
  }
}
