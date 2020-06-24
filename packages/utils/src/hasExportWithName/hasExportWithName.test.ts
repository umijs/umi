import { join } from 'path';
import { hasExportWithName } from './hasExportWithName';

const filePath = join(__dirname, 'fixtures', 'app.ts')

test('name1', () => {
  const hasExport = hasExportWithName({
    name: 'name1',
    filePath,
  })!;
  expect(hasExport).toBeTruthy();
});

test('name2', () => {
  const hasExport = hasExportWithName({
    name: 'name2',
    filePath,
  })!;
  expect(hasExport).toBeTruthy();
});

test('name3', () => {
  const hasExport = hasExportWithName({
    name: 'name3',
    filePath,
  })!;
  expect(hasExport).toBeTruthy();
});

test('name4', () => {
  const hasExport = hasExportWithName({
    name: 'name4',
    filePath,
  })!;
  expect(hasExport).toBeFalsy();
});

test('name5', () => {
  const hasExport = hasExportWithName({
    name: 'name5',
    filePath,
  })!;
  expect(hasExport).toBeTruthy();
});
