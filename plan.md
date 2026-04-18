1. Set up test environment
   - Configure bunfig.toml for testing
   - Create setupTests.ts with global DOM setup

2. Write unit tests
   - Test utility functions (`utils/cn.ts`, `utils/image-utils.ts`, etc.)

3. Write integration tests
   - Test React context and component integration (e.g. `CartContext`)

4. Write regression tests
   - Test critical path user flows that are prone to breaking.

5. Write edge case tests
   - Test extreme or unexpected inputs, missing properties, zero quantities, empty responses.

6. Write state transition and reset tests
   - Test that components correctly transition states and can reset to their initial state.

7. Write stress test
   - Test performance of an endpoint/utility by throwing large arrays/lots of requests to a utility.

8. Complete pre commit steps
   - Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.

9. Submit changes
   - Create PR and submit changes.
