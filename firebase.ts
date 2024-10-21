import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // Config details (not used in mock implementation)
};

const app = initializeApp(firebaseConfig);

// Mock database
const mockDb: { [collection: string]: any[] } = {
  vehicles: [],
  reservations: [],
  checkInOuts: [],
};

// Mock Firestore implementation
const db = {
  collection: (collectionName: string) => ({
    add: (data: any) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newDoc = { id, ...data };
      mockDb[collectionName].push(newDoc);
      return Promise.resolve({ id });
    },
    get: () => {
      return Promise.resolve({
        docs: mockDb[collectionName].map(doc => ({
          id: doc.id,
          data: () => ({ ...doc }),
        })),
      });
    },
    doc: (id: string) => ({
      get: () => {
        const doc = mockDb[collectionName].find(item => item.id === id);
        return Promise.resolve({
          exists: !!doc,
          data: () => doc ? { ...doc } : undefined,
          id,
        });
      },
      update: (data: any) => {
        const index = mockDb[collectionName].findIndex(item => item.id === id);
        if (index !== -1) {
          mockDb[collectionName][index] = { ...mockDb[collectionName][index], ...data };
        }
        return Promise.resolve();
      },
      delete: () => {
        const index = mockDb[collectionName].findIndex(item => item.id === id);
        if (index !== -1) {
          mockDb[collectionName].splice(index, 1);
        }
        return Promise.resolve();
      },
    }),
  }),
};

const query = (collectionName: string, conditions: any[] = [], orderByField?: string) => {
  return {
    get: () => {
      let results = mockDb[collectionName];

      // Apply filters
      results = results.filter(item =>
        conditions.every(condition => {
          const [field, op, value] = condition;
          switch (op) {
            case '==':
              return item[field] === value;
            case 'in':
              return value.includes(item[field]);
            default:
              return true;
          }
        })
      );

      // Apply ordering
      if (orderByField) {
        results.sort((a, b) => (a[orderByField] > b[orderByField] ? 1 : -1));
      }

      return Promise.resolve({
        docs: results.map(doc => ({
          id: doc.id,
          data: () => ({ ...doc }),
        })),
      });
    },
  };
};

const where = (field: string, op: string, value: any) => [field, op, value];
const orderBy = (field: string) => field;

console.log('Using mock Firestore implementation');

export { db, query, where, orderBy };
