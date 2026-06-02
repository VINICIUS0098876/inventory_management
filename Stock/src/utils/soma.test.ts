import { describe, it, expect } from '@jest/globals';
import {soma} from './soma';

describe("soma", () => {
    it("deve retornar a soma de dois numeros", () => {
        const resultado = soma(2, 2)
        expect(resultado).toBe(4)
    })
})


