Primal-dual interior-point methods (IPMs) are among the most powerful algorithms for linear and convex optimization. Since Karmarkar's breakthrough in 1984, IPMs have evolved into the default choice for large-scale linear programming (LP). This post derives the core algorithm from scratch and provides a working implementation.

## Why Interior-Point Methods?

The simplex method travels along the boundary of the feasible polytope. In contrast, IPMs follow a **central path** through the interior, using barrier functions to avoid the boundary until convergence. This gives IPMs two key advantages:

- **Polynomial complexity**: Unlike simplex (exponential in worst case), IPMs guarantee $O(\sqrt{n} \log(1/\epsilon))$ iterations
- **Practical scalability**: IPMs exploit sparse linear algebra, scaling to millions of variables

## The Primal-Dual Framework

Consider the standard-form LP:

$$
\begin{aligned}
\min_x \quad & c^T x \\
\text{s.t.} \quad & Ax = b \\
& x \geq 0
\end{aligned}
$$

The KKT conditions for optimality are:

$$
\begin{aligned}
A^T y + s &= c \\
Ax &= b \\
x_i s_i &= 0, \quad i = 1, \ldots, n \\
x, s &\geq 0
\end{aligned}
$$

where $y \in \mathbb{R}^m$ are Lagrange multipliers and $s \in \mathbb{R}^n$ are dual slacks. The complementarity condition $x_i s_i = 0$ is what makes this hard — it's nonconvex and combinatorial.

### The Barrier Approach

IPMs replace the hard complementarity $x_i s_i = 0$ with the relaxed condition:

$$x_i s_i = \mu, \quad \mu > 0$$

As $\mu \to 0$, we approach the true solution. The parameter $\mu$ is called the **barrier parameter**. For a given $\mu$, the system becomes:

$$F(x, y, s; \mu) = \begin{bmatrix} A^T y + s - c \\ Ax - b \\ X S e - \mu e \end{bmatrix} = 0$$

where $X = \text{diag}(x)$, $S = \text{diag}(s)$, and $e = (1, \ldots, 1)^T$.

### Newton's Method

We solve $F = 0$ using Newton's method. The Jacobian is:

$$
J = \begin{bmatrix}
0 & A^T & I \\
A & 0 & 0 \\
S & 0 & X
\end{bmatrix}
$$

The Newton step $(\Delta x, \Delta y, \Delta s)$ solves:

$$
\begin{bmatrix}
0 & A^T & I \\
A & 0 & 0 \\
S & 0 & X
\end{bmatrix}
\begin{bmatrix} \Delta x \\ \Delta y \\ \Delta s \end{bmatrix}
= -\begin{bmatrix} A^T y + s - c \\ Ax - b \\ X S e - \mu e \end{bmatrix}
$$

After some algebraic manipulation, we obtain the **normal equations**:

$$A (S^{-1} X) A^T \Delta y = r$$

This is an $m \times m$ symmetric positive definite system — the workhorse of every IPM implementation.

## A Minimal Implementation

Here is a complete primal-dual IPM in Julia:

```julia
using LinearAlgebra, SparseArrays

function solve_lp(A, b, c; max_iter=100, tol=1e-8)
    m, n = size(A)

    # Initial point (Mehrotra's heuristic)
    x = ones(n)
    y = zeros(m)
    s = ones(n)

    for iter in 1:max_iter
        # Residuals
        rp = b - A * x          # primal residual
        rd = c - A' * y - s     # dual residual

        # Check convergence
        mu = dot(x, s) / n
        if norm(rp) < tol && norm(rd) < tol && mu < tol
            println("Converged in $iter iterations")
            return x, y, s
        end

        # Barrier parameter
        sigma = 0.1
        mu_target = sigma * mu

        # Form the augmented system
        D = sqrt.(s ./ x)
        A_scaled = A ./ D'

        # Normal equations: A D^{-2} A^T Δy = rhs
        # Equivalent to: (A_scaled * A_scaled') Δy = ...
        M = A_scaled * A_scaled'

        rhs = rp + A * (x .* (mu_target .- x .* s) ./ (x .* s)) ./ s
        # Simplified RHS for didactic purposes
        dy = M \ rhs

        ds = -rd - A' * dy
        dx = (mu_target .- x .* s .- x .* ds) ./ s

        # Step size (ensure x, s > 0)
        alpha_p = min(0.99 * minimum(-x[dx .< 0] ./ dx[dx .< 0]), 1.0)
        alpha_d = min(0.99 * minimum(-s[ds .< 0] ./ ds[ds .< 0]), 1.0)

        # Update
        x .+= alpha_p .* dx
        y .+= alpha_d .* dy
        s .+= alpha_d .* ds
    end

    error("Failed to converge")
end
```

And the same algorithm in Python using NumPy:

```python
import numpy as np

def solve_lp(A, b, c, max_iter=100, tol=1e-8):
    m, n = A.shape
    
    # Initial point
    x = np.ones(n)
    y = np.zeros(m)
    s = np.ones(n)
    
    for it in range(max_iter):
        # Residuals
        rp = b - A @ x
        rd = c - A.T @ y - s
        
        # Complementarity
        mu = np.dot(x, s) / n
        if np.linalg.norm(rp) < tol and np.linalg.norm(rd) < tol and mu < tol:
            print(f"Converged in {it+1} iterations")
            return x, y, s
        
        sigma = 0.1
        mu_target = sigma * mu
        
        # Form normal equations
        d = s / x
        M = A @ np.diag(1.0 / d) @ A.T
        
        # Solve for Δy (predictor step simplified)
        dy = np.linalg.solve(M, rp)
        ds = -rd - A.T @ dy
        dx = (mu_target - x * s - x * ds) / s
        
        # Step length
        alpha_p = min(0.99 * np.min(-x[dx < 0] / dx[dx < 0]), 1.0) if np.any(dx < 0) else 1.0
        alpha_d = min(0.99 * np.min(-s[ds < 0] / ds[ds < 0]), 1.0) if np.any(ds < 0) else 1.0
        
        x += alpha_p * dx
        y += alpha_d * dy
        s += alpha_d * ds
    
    raise RuntimeError("Failed to converge")
```

## Computational Complexity

Each IPM iteration costs $O(m^2 n + m^3)$ if we form and factor the normal equations directly. For large sparse problems, we use iterative methods (CG) to solve $M \Delta y = r$ approximately, reducing the cost to $O(\text{nnz}(A) \cdot \sqrt{\kappa})$ per iteration.

The total number of iterations is remarkably constant — typically **20–50 iterations** regardless of problem size, a property known as *iteration complexity independence*.

## Key Practical Considerations

### 1. Predictor-Corrector Method (Mehrotra)

The most widely used variant solves two linear systems per iteration:

- **Predictor step** ($\sigma = 0$): Compute the pure Newton direction
- **Corrector step**: Use the predictor to estimate second-order terms and set $\sigma$ adaptively

This typically reduces iterations by 30–50% compared to the basic algorithm.

### 2. Starting Point

A good initial point satisfies $x > 0$, $s > 0$. Common heuristics:

$$x^{(0)} = \max(1, \|b\|_\infty) \cdot e, \quad s^{(0)} = \max(1, \|c\|_\infty) \cdot e$$

### 3. Handling Free Variables

A variable $x_j$ that is unrestricted in sign can be split: $x_j = x_j^+ - x_j^-$ where $x_j^+, x_j^- \geq 0$. Some implementations use a special handling to avoid doubling the variable count.

## Beyond Linear Programming

The primal-dual framework extends naturally to:

| Problem Class | Standard Form |
|---|---|
| Convex QP | $\min \frac{1}{2} x^T Q x + c^T x$ s.t. $Ax = b, x \geq 0$ |
| SOCP | $\min c^T x$ s.t. $\|A_i x + b_i\|_2 \leq c_i^T x + d_i$ |
| SDP | $\min \langle C, X \rangle$ s.t. $\langle A_i, X \rangle = b_i, X \succeq 0$ |

Each requires a different barrier function but follows the same Newton-based framework — a testament to the elegance of interior-point theory.

## References

- Wright, S. J. (1997). *Primal-Dual Interior-Point Methods*. SIAM.
- Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (Chapters 14–19). Springer.
- Gondzio, J. (2012). "Interior point methods 25 years later." *European Journal of Operational Research*, 218(3), 587–601.
- Vandenberghe, L. (2010). "The CVXOPT linear and quadratic cone program solvers." [Online resource](https://cvxopt.org).
