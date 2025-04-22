@echo off
echo Running all tests for Agent Lee & Co.
cd server

echo.
echo ===== Installing dependencies =====
call npm install

echo.
echo ===== Running unit tests =====
call npm run test:unit

echo.
echo ===== Running integration tests =====
call npm run test:integration

echo.
echo ===== Running end-to-end tests =====
call npm run test:e2e

echo.
echo ===== All tests completed =====
echo Check the test reports for results
