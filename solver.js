// This is a simplified solver for the 180 IQ game.
// The full scope of Lv.3 (especially dynamic sigma) is extremely complex.
// This implementation uses Reverse Polish Notation (RPN) for calculations.

const factorial = (n) => {
    if (n < 0 || n > 10) return Infinity; // Limit to prevent huge numbers
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};

// --- RPN Evaluation Logic ---
const evaluateRPN = (rpn) => {
    const stack = [];
    for (const token of rpn) {
        if (typeof token === 'number') {
            stack.push(token);
        } else {
            // Unary operators
            if (token === '!' || token === 'sqrt') {
                if (stack.length < 1) return null; // Invalid expression
                const a = stack.pop();
                if (token === '!') {
                    if (a < 0 || !Number.isInteger(a)) return null;
                    stack.push(factorial(a));
                } else if (token === 'sqrt') {
                    if (a < 0) return null;
                    const res = Math.sqrt(a);
                    if (!Number.isInteger(res)) return null; // No decimals allowed
                    stack.push(res);
                }
            } 
            // Binary operators
            else {
                if (stack.length < 2) return null; // Invalid expression
                const b = stack.pop();
                const a = stack.pop();
                let res;
                switch (token) {
                    case '+': res = a + b; break;
                    case '-': 
                        if (a < b) return null; // No negative intermediate results
                        res = a - b; 
                        break;
                    case '*': res = a * b; break;
                    case '/':
                        if (b === 0 || a % b !== 0) return null; // No division by zero or decimals
                        res = a / b;
                        break;
                    case '^':
                        if (Math.pow(a, b) > 10000) return null; // Limit result size
                        res = Math.pow(a, b);
                        break;
                    case 'root':
                        if (b < 2 || a < 0) return null;
                        res = Math.pow(a, 1/b);
                        if (Math.abs(res - Math.round(res)) > 0.00001) return null; // No decimals
                        res = Math.round(res);
                        break;
                }
                if (!Number.isInteger(res)) return null;
                stack.push(res);
            }
        }
    }
    if (stack.length !== 1) return null; // Should be one final result
    return stack[0];
};


// --- RPN to Infix String Conversion (for display) ---
const rpnToInfix = (rpn) => {
    const stack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, 'root': 3 };

    for (const token of rpn) {
        if (typeof token === 'number') {
            stack.push({ val: token.toString(), prec: 4 });
        } else {
            if (token === '!' || token === 'sqrt') {
                const a = stack.pop();
                let str;
                if (token === '!') str = `${a.val}!`;
                if (token === 'sqrt') str = `sqrt(${a.val})`;
                stack.push({ val: str, prec: 4 });
            } else {
                 const b = stack.pop();
                 const a = stack.pop();
                 const opPrec = precedence[token];
                 const valA = a.prec < opPrec ? `(${a.val})` : a.val;
                 const valB = b.prec <= opPrec ? `(${b.val})` : b.val;
                 let str;
                 if(token === 'root') str = `${valB} root ${valA}`;
                 else str = `${valA}${token}${valB}`;
                 stack.push({ val: str, prec: opPrec });
            }
        }
    }
    return stack[0].val;
};


// --- Main Solver Logic ---
export const findSolutions = (numbers, target, level) => {
    const opsByLevel = {
        'B': ['+', '-', '*', '/'],
        '1': ['+', '-', '*', '/', '^'],
        '2': ['+', '-', '*', '/', '^', 'sqrt', 'root'],
        '3': ['+', '-', '*', '/', '^', 'sqrt', 'root', '!']
    };
    const operators = opsByLevel[level] || opsByLevel['B'];

    const solutions = new Map();
    let closest = { value: -Infinity, expression: '', distance: Infinity };

    // Generate permutations of numbers
    const getPermutations = (arr) => {
        if (arr.length === 0) return [[]];
        const firstEl = arr[0];
        const rest = arr.slice(1);
        const permsWithoutFirst = getPermutations(rest);
        const allPermutations = [];
        permsWithoutFirst.forEach(perm => {
            for (let i = 0; i <= perm.length; i++) {
                const permWithFirst = [...perm.slice(0, i), firstEl, ...perm.slice(i)];
                allPermutations.push(permWithFirst);
            }
        });
        return allPermutations;
    };
    const numPermutations = [...new Set(getPermutations(numbers).map(p => p.join(',')))].map(s => s.split(',').map(Number));

    // Recursive function to generate RPN expressions and evaluate them
    const solve = (nums, ops) => {
        if (nums.length === 1 && ops.length === 0) {
            const rpn = nums;
            const value = evaluateRPN(rpn);
            if (value !== null) {
                updateSolutions(value, rpn, 'normal');
            }
            return;
        }

        // Try applying a binary operator
        if (nums.length >= 2 && ops.length > 0) {
            for (let i = 0; i < ops.length; i++) {
                const newNums = [ ...nums.slice(0, -2), [nums[nums.length-2], nums[nums.length-1], ops[i]] ];
                const newOps = [...ops.slice(0, i), ...ops.slice(i+1)];
                // This is a simplified RPN builder, a full one is more complex
                // For this problem, we can just generate all operator combinations
            }
        }
    };
    
    // Brute-force RPN generation (simpler to implement)
    function generateAndTest(currentRPN, remainingNums, remainingOps) {
        if (remainingNums.length === 0 && remainingOps.length === 0) {
            const value = evaluateRPN(currentRPN);
            if (value !== null) {
                updateSolutions(value, currentRPN, 'normal');
            }
            return;
        }

        // Add a number
        if (remainingNums.length > 0) {
            generateAndTest([...currentRPN, remainingNums[0]], remainingNums.slice(1), remainingOps);
        }

        // Add an operator
        const numCount = currentRPN.filter(x => typeof x === 'number').length;
        const opCount = currentRPN.filter(x => typeof x === 'string').length;
        if (remainingOps.length > 0 && numCount > opCount + 1) {
            for (let i = 0; i < remainingOps.length; i++) {
                 generateAndTest([...currentRPN, remainingOps[i]], remainingNums, [...remainingOps.slice(0,i), ...remainingOps.slice(i+1)]);
            }
        }
    }
    
     const generateOpCombinations = (ops, length, current = []) => {
        if (current.length === length) {
            return [current];
        }
        let results = [];
        for (const op of ops) {
            results = results.concat(generateOpCombinations(ops, length, [...current, op]));
        }
        return results;
    };


    for (const p of numPermutations) {
        const opCombos = generateOpCombinations(operators, p.length - 1);
        for (const opCombo of opCombos) {
             // A simple way to structure RPN: all numbers then all operators
             // This covers expressions like ((a op b) op c) op d
             let rpn = [...p];
             for(const op of opCombo) rpn.push(op);
             let value = evaluateRPN(rpn);
             if (value !== null) updateSolutions(value, rpn, 'normal');
             
             // Try other RPN structures (this is not exhaustive but covers common cases)
             if (p.length === 4) { // e.g., (a op b) op (c op d)
                rpn = [p[0], p[1], opCombo[0], p[2], p[3], opCombo[1], opCombo[2]];
                value = evaluateRPN(rpn);
                if (value !== null) updateSolutions(value, rpn, 'normal');
             }
              if (p.length === 5) { // e.g., (a*b) + (c*d) + e
                rpn = [p[0],p[1],opCombo[0], p[2],p[3],opCombo[1], opCombo[2], p[4], opCombo[3]]
                value = evaluateRPN(rpn);
                if (value !== null) updateSolutions(value, rpn, 'normal');
              }
        }
        
        // Try with unary operators (factorial, sqrt)
        if (level >= 2) {
             for (let i = 0; i < p.length; i++) {
                let tempP = [...p];
                // Apply sqrt
                if (operators.includes('sqrt')) {
                    const sqrtVal = Math.sqrt(tempP[i]);
                    if (Number.isInteger(sqrtVal)) {
                        tempP[i] = sqrtVal;
                        // Rerun solver with this modified set
                        const subSolutions = findSolutions(tempP, target, level);
                        subSolutions.exactSolutions.forEach(s => updateSolutions(s.value, s.rpn, s.type, s.sigma));
                    }
                }
                 // Apply factorial
                 if (operators.includes('!')) {
                     const factVal = factorial(tempP[i]);
                     if (factVal !== Infinity) {
                         tempP[i] = factVal;
                         const subSolutions = findSolutions(tempP, target, level);
                         subSolutions.exactSolutions.forEach(s => updateSolutions(s.value, s.rpn, s.type, s.sigma));
                     }
                 }
             }
        }
    }
    
     // --- SIMPLIFIED SIGMA HANDLING (Level 3) ---
    if (level === 3) {
        // Example: sigma i=a->b (i)
        // Try using two numbers from permutation for start/end
        for (const p of numPermutations) {
            for (let i = 0; i < p.length; i++) {
                for (let j = 0; j < p.length; j++) {
                    if (i === j) continue;
                    
                    const start = p[i];
                    const end = p[j];
                    if (start >= end || end - start > 20) continue; // Range limit

                    const remainingNums = p.filter((_, idx) => idx !== i && idx !== j);

                    // Case 1: Sigma(i) + rest
                    let sum = 0;
                    for (let k = start; k <= end; k++) sum += k;
                    const newNums = [...remainingNums, sum];
                    if (newNums.length > 0) {
                        const subSolutions = findSolutions(newNums, target, Math.min(level, 2)); // Recurse without sigma
                         subSolutions.exactSolutions.forEach(s => {
                            if (s.value === target) {
                                // This part is complex: need to reconstruct the full expression
                                // Simplified for now: just show sigma part if it's the answer
                            }
                         });
                    }
                     if(sum === target) {
                         solutions.set(target, { value: target, type: 'sigma', sigma: { start, end, body: 'i' }, score: 100 });
                     }
                }
            }
        }
    }


    function updateSolutions(value, rpn, type, sigmaData = null) {
        const distance = Math.abs(value - target);
        if (distance < closest.distance) {
            closest = { value, expression: rpnToInfix(rpn), distance, rpn, type, sigma: sigmaData, score: calculateScore(rpn) };
        }
        if (value === target) {
            if (!solutions.has(value)) {
                 solutions.set(value, { value, expression: rpnToInfix(rpn), rpn, type, sigma: sigmaData, score: calculateScore(rpn) });
            }
        }
    }
    
    function calculateScore(rpn) {
        let score = 0;
        const complexity = {'^': 5, 'sqrt': 6, 'root': 7, '!': 8};
        rpn.forEach(token => {
            score += (complexity[token] || 1);
        });
        return score;
    }


    const exactSolutions = Array.from(solutions.values())
        .filter(s => s.value === target)
        .sort((a,b) => a.score - b.score)
        .slice(0, 3);
        
    return { exactSolutions, closest: closest.distance !== Infinity ? closest : null };
};
