---
layout: post
title: "大规模线性规划算法概述"
date: 2026-05-01 10:00:00
description: 从单纯形法到内点法，再到列生成与 ADMM，介绍求解大规模线性规划问题的核心算法
categories: notes
---

线性规划 (Linear Programming, LP) 是运筹学和优化理论的基石。标准形式为：

$$
\begin{aligned}
\min_{x} \quad & c^\top x \\
\text{s.t.} \quad & Ax = b \\
& x \geq 0
\end{aligned}
$$

其中 $A \in \mathbb{R}^{m \times n}$，$c \in \mathbb{R}^n$，$b \in \mathbb{R}^m$。当问题规模增大到数万乃至数百万变量和约束时，经典算法面临巨大挑战。本文梳理几类求解大规模 LP 的核心方法。

## 单纯形法 (Simplex Method)

单纯形法由 Dantzig 于 1947 年提出，至今仍是最广泛使用的 LP 求解器之一。其基本思想是：从一个基可行解出发，沿着可行域的边移动到相邻的更优顶点，直到达到最优。

每一步迭代中，当前基矩阵 $B$ 对应的解为：

$$
x_B = B^{-1}b, \quad x_N = 0
$$

其中 $N$ 为非基变量的索引集。检验数 (reduced cost) 为：

$$
\bar{c}_j = c_j - c_B^\top B^{-1} A_j
$$

若所有 $\bar{c}_j \geq 0$，则当前解为最优；否则选择 $\bar{c}_j < 0$ 的变量入基。

**大规模场景下的改进：**

- **稀疏矩阵技术**：大规模 LP 的矩阵 $A$ 通常是稀疏的。LU 分解中利用稀疏结构可大幅减少计算量和内存占用。
- **Revised Simplex**：显式维护 $B^{-1}$ 的乘积形式或 LU 分解，避免每次迭代都求解完整的线性方程组。
- **Criss-Cross 和 Devex 方法**：通过不同的主元选取策略减少退化和数值误差。

单纯形法在实践中表现优异，但最坏情况下的迭代次数是指数级的。对于超大规模问题（$n > 10^6$），每次迭代的基矩阵操作成本成为瓶颈。

## 内点法 (Interior Point Method)

1984 年 Karmarkar 提出投影尺度法后，内点法成为求解 LP 的另一大类方法。与单纯形法沿边界移动不同，内点法从可行域内部沿中心路径 (central path) 逼近最优解。

### 原始-对偶路径跟踪法

引入松弛变量 $s$，考虑 KKT 条件：

$$
\begin{aligned}
Ax &= b, \quad x \geq 0 \\
A^\top y + s &= c, \quad s \geq 0 \\
X S e &= 0
\end{aligned}
$$

其中 $X = \text{diag}(x)$，$S = \text{diag}(s)$，$e = (1, \ldots, 1)^\top$。互补松弛条件 $X S e = 0$ 被松弛为 $X S e = \mu e$，$\mu > 0$ 为扰动参数，定义了中心路径。

用牛顿法求解扰动系统，得到搜索方向：

$$
\begin{bmatrix}
A & 0 & 0 \\
0 & A^\top & I \\
S & 0 & X
\end{bmatrix}
\begin{bmatrix}
\Delta x \\
\Delta y \\
\Delta s
\end{bmatrix}
=
\begin{bmatrix}
b - Ax \\
c - A^\top y - s \\
\mu e - X S e
\end{bmatrix}
$$

每步迭代执行更新 $x \leftarrow x + \alpha \Delta x$，$y \leftarrow y + \alpha \Delta y$，$s \leftarrow s + \alpha \Delta s$，步长 $\alpha$ 保证 $x, s > 0$。

**大规模场景下的改进：**

内点法每步需求解一个 $m \times m$ 的法方程系统：

$$
(A S^{-1} X A^\top) \Delta y = \text{rhs}
$$

当 $m$ 很大时，直接求解代价高昂。常见策略包括：

- **预条件共轭梯度法 (PCG)**：用不完全 Cholesky 分解作为预条件子，迭代求解法方程，避免显式构造和分解大型矩阵。
- **并行化**：矩阵-向量乘法和 PCG 迭代天然适合并行计算。
- **Mehrotra 预测-校正**：通过额外的校正步提升收敛速度，实践中通常在 20–60 步内收敛。

内点法的迭代次数对问题规模不敏感（多项式时间复杂度 $O(\sqrt{n} L)$，$L$ 为输入长度），这使其在大规模问题上优于单纯形法。但每次迭代的计算成本更高，且难以利用热启动 (warm start)。

## 分解算法 (Dececomposition Methods)

当 LP 具有特殊的块结构时，分解算法通过将大问题拆分为若干子问题来降低求解难度。

### Dantzig-Wolfe 分解

考虑具有链接约束的块结构：

$$
\begin{aligned}
\min \quad & c_1^\top x_1 + c_2^\top x_2 + \cdots + c_p^\top x_p \\
\text{s.t.} \quad & A_1 x_1 + A_2 x_2 + \cdots + A_p x_p = b_0 \\
& B_i x_i = b_i, \quad x_i \geq 0, \quad i = 1, \ldots, p
\end{aligned}
$$

利用凸组合定理，将每个子问题的可行域表示为极点 (extreme points) 的凸组合：

$$
x_i = \sum_{j=1}^{N_i} \lambda_{ij} v_{ij}, \quad \sum_{j=1}^{N_i} \lambda_{ij} = 1, \quad \lambda_{ij} \geq 0
$$

替换后得到**主问题 (Master Problem)**，通过列生成逐步引入有价值的列（即极点）。这正是下文列生成方法的核心思想。

### Benders 分解

Benders 分解处理另一类结构——将变量分为"难"变量和"易"变量。对于 LP，固定难变量 $x$ 后，子问题是关于 $y$ 的 LP：

$$
\begin{aligned}
Z(x) = \min_y \quad & d^\top y \\
\text{s.t.} \quad & Dy \geq h - Fx \\
& y \geq 0
\end{aligned}
$$

通过对偶理论，子问题不可行时添加**可行性割 (feasibility cut)**，子问题最优时添加**最优性割 (optimality cut)**，逐步收紧主问题的可行域。

## 列生成 (Column Generation)

列生成是大规模 LP 最重要的方法之一，特别适用于变量极多但大部分变量在最优解中为零的场景。典型应用包括切割库存问题 (Cutting Stock Problem)、车辆路径问题 (VRP) 等。

### 框架

设主问题 (Restricted Master Problem, RMP) 为：

$$
\begin{aligned}
\min \quad & \sum_{j \in \Omega} c_j \lambda_j \\
\text{s.t.} \quad & \sum_{j \in \Omega} a_j \lambda_j = b \\
& \lambda_j \geq 0, \quad j \in \Omega
\end{aligned}
$$

其中 $\Omega$ 是所有可能的列（变量）集合，初始时只包含一个有限子集。求解 RMP 得到对偶变量 $y^*$，然后求解**定价子问题 (Pricing Subproblem)**：

$$
\bar{c}_k = \min_{j \in \Omega} \left( c_j - {y^*}^\top a_j \right)
$$

若 $\bar{c}_k \geq 0$，所有非基列的检验数非负，当前解即为全局最优；否则将对应列 $a_k$ 加入 RMP，重新求解。

列生成的核心在于：即使 $\Omega$ 是指数级大小的集合，定价子问题往往可以高效求解（例如用动态规划），从而避免枚举所有列。

### 分支定价 (Branch-and-Price)

列生成只能得到 LP 松弛的最优解。为获得整数解，需将列生成嵌入分支定界框架，即**分支定价**。在每个分支节点上执行列生成，分支规则需针对列生成的特殊性进行设计。

## 一阶方法 (First-Order Methods)

当问题规模达到千万级变量和约束时，二阶方法（内点法）的矩阵运算变得不可行。一阶方法只利用梯度信息，单步计算代价低，适合超大规模场景。

### ADMM (交替方向乘子法)

考虑带等式约束的 LP：

$$
\min_{x} \; c^\top x \quad \text{s.t.} \quad Ax = b, \; x \geq 0
$$

引入辅助变量 $z = x$，构造增广拉格朗日函数：

$$
L_\rho(x, z, y) = c^\top x + y^\top (Ax - b) + \frac{\rho}{2} \|Ax - b\|^2 + y^\top (x - z) + \frac{\rho}{2} \|x - z\|^2
$$

ADMM 的迭代格式为：

$$
\begin{aligned}
x^{k+1} &= \arg\min_x \; L_\rho(x, z^k, y^k) \\
z^{k+1} &= \arg\min_{z \geq 0} \; \frac{\rho}{2} \|x^{k+1} - z + u^k\|^2 \\
u^{k+1} &= u^k + x^{k+1} - z^{k+1}
\end{aligned}
$$

其中 $u = y / \rho$ 为缩放对偶变量。子问题均为闭式解或易求解的投影问题。ADMM 收敛速度为 $O(1/k)$，但对大规模稀疏问题非常实用。

### 近端梯度法 (Proximal Gradient Method)

将 LP 改写为：

$$
\min_x \; f(x) + g(x)
$$

其中 $f(x) = c^\top x$（线性），$g(x)$ 为约束的示性函数。近端梯度迭代为：

$$
x^{k+1} = \text{prox}_{\alpha g} \left( x^k - \alpha \nabla f(x^k) \right) = \text{prox}_{\alpha g} \left( x^k - \alpha c \right)
$$

对于非负约束，近端算子退化为逐分量的截断：

$$
[\text{prox}_{\alpha g}(v)]_i = \max(v_i, 0)
$$

通过 Nesterov 加速可将收敛率提升至 $O(1/k^2)$。

## 方法比较与选择

| 方法          | 时间复杂度             | 适合场景                     | 局限性                 |
| ------------- | ---------------------- | ---------------------------- | ---------------------- |
| 单纯形法      | 指式最坏，实践中多项式 | 中等规模、热启动、敏感性分析 | 超大规模时基操作昂贵   |
| 内点法        | $O(\sqrt{n} L)$        | 大规模、高精度要求           | 难以热启动、内存需求高 |
| Dantzig-Wolfe | 依赖子问题             | 块结构、列稀疏               | 需要特殊结构           |
| Benders       | 依赖主问题             | 链接约束少、子问题易解       | 需要特殊结构           |
| 列生成        | 依赖定价子问题         | 变量极多、定价可解           | 需设计高效定价器       |
| ADMM          | $O(1/k)$               | 超大规模、分布式、低精度容忍 | 收敛慢、精度有限       |

实际中，选择哪种方法取决于问题结构、规模、精度要求和可用计算资源。商业求解器如 Gurobi、CPLEX 通常会根据问题特征自动选择算法，或结合多种方法（如单纯形法预处理 + 内点法求解）。

## 参考文献

- Dantzig, G. B. (1963). _Linear Programming and Extensions_. Princeton University Press.
- Nocedal, J. & Wright, S. J. (2006). _Numerical Optimization_. Springer.
- Bertsimas, D. & Tsitsiklis, J. N. (1997). _Introduction to Linear Optimization_. Athena Press.
- Boyd, S. et al. (2011). Distributed Optimization and Statistical Learning via the Alternating Direction Method of Multipliers. _Foundations and Trends in Machine Learning_, 3(1), 1–122.
