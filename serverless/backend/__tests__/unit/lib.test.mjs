import { bail } from '../../src/lib';

describe('Test lib', function () {
    it('should have a bail function', async () => {
        expect(bail).toBeDefined();
    });
});

describe('function bail', function () {
    it ('should have cors headers', async () => {
        const result = bail(200, "hello world");

        expect(result.headers).toBeDefined();
        expect(result.headers["Access-Control-Allow-Headers"]).toEqual("Content-Type"); 
    });
});