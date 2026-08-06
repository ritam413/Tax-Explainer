import assert from 'node:assert';
import { getUserBookmarks, addBookmark, removeBookmark } from './service';

async function runTests() {
  console.log('🧪 Starting Bookmark Service Unit Tests...');

  const TEST_USER = 'test_user_phase6';

  // Test 1: Pre-seeded demo bookmarks
  const demoBookmarks = await getUserBookmarks('demo_user_2026');
  assert.strictEqual(
    demoBookmarks.length >= 2,
    true,
    'Expected at least 2 demo bookmarks for demo_user_2026'
  );
  assert.strictEqual(demoBookmarks[0].user_id, 'demo_user_2026');
  console.log('✅ Test 1 Passed: Demo user bookmarks retrieved successfully.');

  // Test 2: Add new sector bookmark
  const newBm = await addBookmark(TEST_USER, {
    item_type: 'sector',
    item_id: 'sec-education',
    title: 'Education & Skill Building',
    subtitle: 'India Union Budget 2026',
    metadata: {
      category: 'Education & Skill Building',
      allocatedAmount: 1.48,
      country: 'India',
      year: 2026,
    },
  });

  assert.ok(newBm, 'Expected bookmark object to be created');
  assert.ok(newBm.id.includes('sec-education'), 'Expected ID to contain sec-education');
  assert.strictEqual(newBm.user_id, TEST_USER);

  const userBookmarks = await getUserBookmarks(TEST_USER);
  assert.strictEqual(
    userBookmarks.some((bm) => bm.item_id === 'sec-education'),
    true,
    'Expected sec-education in user bookmarks'
  );
  console.log('✅ Test 2 Passed: Sector bookmark creation verified.');

  // Test 3: Duplicate prevention
  const bm1 = await addBookmark(TEST_USER, {
    item_type: 'sector',
    item_id: 'sec-health',
    title: 'Healthcare & Sanitation',
    subtitle: 'India 2026',
  });

  const bm2 = await addBookmark(TEST_USER, {
    item_type: 'sector',
    item_id: 'sec-health',
    title: 'Healthcare & Sanitation',
    subtitle: 'India 2026',
  });

  assert.strictEqual(bm1.id, bm2.id, 'Duplicate add should return existing bookmark');
  const userBookmarks2 = await getUserBookmarks(TEST_USER);
  const healthMatches = userBookmarks2.filter((bm) => bm.item_id === 'sec-health');
  assert.strictEqual(healthMatches.length, 1, 'Duplicate bookmark prevented successfully');
  console.log('✅ Test 3 Passed: Duplicate bookmark prevention verified.');

  // Test 4: Remove bookmark
  const addedComp = await addBookmark(TEST_USER, {
    item_type: 'comparison',
    item_id: 'compare-test-123',
    title: 'Test Comparison',
  });

  const removed = await removeBookmark(TEST_USER, addedComp.id);
  assert.strictEqual(removed, true, 'Expected removal to return true');

  const userBookmarks3 = await getUserBookmarks(TEST_USER);
  assert.strictEqual(
    userBookmarks3.some((bm) => bm.id === addedComp.id),
    false,
    'Removed bookmark should not exist'
  );
  console.log('✅ Test 4 Passed: Bookmark removal verified.');

  // Test 5: Orphaned budget item detection
  const orphanedBm = await addBookmark(TEST_USER, {
    item_type: 'sector',
    item_id: 'non-existent-sector-xyz',
    title: 'Deleted Legacy Sector',
    subtitle: 'India 2026',
    metadata: {
      category: 'NonExistentCategoryXYZ',
      country: 'India',
      year: 2026,
    },
  });

  const userBookmarks4 = await getUserBookmarks(TEST_USER);
  const target = userBookmarks4.find((bm) => bm.id === orphanedBm.id);
  assert.strictEqual(
    target?.metadata?.isOrphaned,
    true,
    'Expected non-existent sector to be marked as orphaned'
  );
  console.log('✅ Test 5 Passed: Orphaned budget item detection verified.');

  console.log('🎉 ALL BOOKMARK SERVICE TESTS PASSED PERFECTLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
