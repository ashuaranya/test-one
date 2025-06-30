const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/github';

// Test function to demonstrate collection fetching
async function testCollections() {
  try {
    console.log('🚀 Testing GitHub Integration Collection Fetching API\n');

    // 1. Get all collections with counts and column details
    console.log('1. Getting all collections with counts and column details...');
    const collectionsResponse = await axios.get(`${BASE_URL}/collections`);
    console.log('Collections Response:');
    console.log('Success:', collectionsResponse.data.success);
    console.log('Total Collections:', collectionsResponse.data.totalCollections);
    console.log('\nCollection Details:');
    
    Object.entries(collectionsResponse.data.data).forEach(([key, collection]) => {
      console.log(`\n📊 ${collection.name} (${collection.count} items):`);
      console.log('Columns:');
      collection.columns.forEach(col => {
        console.log(`  - ${col.headerName} (${col.field}): ${col.type}, width: ${col.width}, sortable: ${col.sortable}, searchable: ${col.searchable || false}, filterable: ${col.filterable || false}`);
      });
    });
    console.log('');

    // 2. Get organizations with pagination and search
    console.log('2. Getting organizations with pagination...');
    const orgsResponse = await axios.get(`${BASE_URL}/organizations?page=1&limit=5&sortBy=name&sortOrder=asc`);
    console.log('Organizations Response:');
    console.log('Success:', orgsResponse.data.success);
    console.log('Data Count:', orgsResponse.data.data.length);
    console.log('Pagination:', orgsResponse.data.pagination);
    console.log('');

    // 3. Get repositories with filtering
    console.log('3. Getting repositories with search...');
    const reposResponse = await axios.get(`${BASE_URL}/repositories?page=1&limit=3&search=test&sortBy=name&sortOrder=asc`);
    console.log('Repositories Response:');
    console.log('Success:', reposResponse.data.success);
    console.log('Data Count:', reposResponse.data.data.length);
    console.log('Pagination:', reposResponse.data.pagination);
    console.log('');

    // 4. Get commits with author filtering
    console.log('4. Getting commits with author filter...');
    const commitsResponse = await axios.get(`${BASE_URL}/commits?page=1&limit=5&sortBy=date&sortOrder=desc`);
    console.log('Commits Response:');
    console.log('Success:', commitsResponse.data.success);
    console.log('Data Count:', commitsResponse.data.data.length);
    console.log('Pagination:', commitsResponse.data.pagination);
    console.log('');

    // 5. Get pull requests with state filtering
    console.log('5. Getting pull requests with state filter...');
    const pullsResponse = await axios.get(`${BASE_URL}/pulls?page=1&limit=5&state=open&sortBy=createdAt&sortOrder=desc`);
    console.log('Pull Requests Response:');
    console.log('Success:', pullsResponse.data.success);
    console.log('Data Count:', pullsResponse.data.data.length);
    console.log('Pagination:', pullsResponse.data.pagination);
    console.log('');

    // 6. Get issues with search
    console.log('6. Getting issues with search...');
    const issuesResponse = await axios.get(`${BASE_URL}/issues?page=1&limit=5&search=bug&sortBy=createdAt&sortOrder=desc`);
    console.log('Issues Response:');
    console.log('Success:', issuesResponse.data.success);
    console.log('Data Count:', issuesResponse.data.data.length);
    console.log('Pagination:', issuesResponse.data.pagination);
    console.log('');

    // 7. Get users with pagination
    console.log('7. Getting users with pagination...');
    const usersResponse = await axios.get(`${BASE_URL}/users?page=1&limit=5&sortBy=login&sortOrder=asc`);
    console.log('Users Response:');
    console.log('Success:', usersResponse.data.success);
    console.log('Data Count:', usersResponse.data.data.length);
    console.log('Pagination:', usersResponse.data.pagination);
    console.log('');

    console.log('✅ All collection tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing collections:', error.response?.data || error.message);
  }
}

// Example usage of query parameters
console.log('📋 Available Query Parameters:');
console.log('- page: Page number (default: 1)');
console.log('- limit: Items per page (default: 10, max: 100)');
console.log('- search: Search term for filtering');
console.log('- sortBy: Field to sort by');
console.log('- sortOrder: Sort order (asc/desc)');
console.log('- orgId: Filter by organization ID (repositories)');
console.log('- repoId: Filter by repository ID (commits, pulls, issues)');
console.log('- author: Filter by author (commits)');
console.log('- state: Filter by state (pulls, issues)');
console.log('- issueId: Filter by issue ID (changelogs)');
console.log('');

// Column types and features
console.log('📊 Column Types and Features:');
console.log('- type: string, date, image');
console.log('- sortable: true/false');
console.log('- searchable: true/false');
console.log('- filterable: true/false');
console.log('- width: column width in pixels');
console.log('');

// Run the test
testCollections(); 