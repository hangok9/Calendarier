# Análisis Extenso del Álgebra Relacional

---

## 1. Introducción

El álgebra relacional es un lenguaje procedural de consulta para bases de datos relacionales. Fue introducido por **Edgar F. Codd** en 1970 como base teórica del modelo relacional y permite especificar **qué datos se desean obtener** y **cómo obtenerlos** mediante una secuencia de operaciones sobre relaciones (tablas).  

A diferencia del cálculo relacional (que es declarativo), el álgebra relacional proporciona una **receta paso a paso** que el motor de la base de datos puede ejecutar. Cada operación toma una o más relaciones como entrada y produce una nueva relación como salida, manteniendo el esquema (esquema de columnas) bien definido.

Este documento ofrece una visión completa, desde los fundamentos hasta los conceptos avanzados, con ejemplos prácticos y notas sobre su relación con SQL.

---

## 2. Fundamentos

### 2.1. Relación y Tupla
- **Relación (Relation)**: conjunto de tuplas (rows) con un mismo esquema (conjunto de atributos, columnas).  
- **Tupla (Tuple)**: fila individual; un conjunto de valores, uno por cada atributo.

Notación: una relación **R** con atributos **A1, A2, …, An** se escribe como  
`R(A1, A2, ..., An)`.

### 2.2. Dominios
Cada atributo tiene un **dominio** (conjunto de valores permitidos). En la práctica, los dominios se corresponden con tipos de datos (INTEGER, VARCHAR, DATE, …).

### 2.3. Estado de una base de datos
Un estado es una asignación de una relación concreta a cada nombre de relación del esquema.

---

## 3. Operaciones Básicas (Algebra Relacional Pura)

Existen ocho operaciones fundamentales; las seis primeras son **cierre** (el resultado sigue siendo una relación). Las últimas dos (intersección y diferencia) se derivan de la diferencia y unión, pero se incluyen por conveniencia.

| Operación | Símbolo | Descripción | Resultado |
|-----------|--------|-------------|-----------|
| **Selección** (Selection) | σ<sub>σ</sub>(R) | Filtra tuplas que cumplen una condición σ (predicado). | Subconjunto de R. |
| **Proyección** (Projection) | Π<sub>A1,…,Ak</sub>(R) | Elimina columnas, mantiene solo los atributos listados (elimina duplicados). | Relación con esquema {A1,…,Ak}. |
| **Renombramiento** (Rename) | ρ<sub>x/A</sub>(R) o ρ<sub>R'(B1,…,Bn)</sub>(R) | Cambia el nombre de la relación o de un atributo. | Misma tuplas, nombres distintos. |
| **Unión** (Union) | R ∪ S | Conjunto de tuplas que aparecen en R o S (requiere misma aridad y dominios compatibles). Elimina duplicados. | Relación con mismas columnas. |
| **Intersección** (Intersection) | R ∩ S | Tuplas presentes tanto en R como en S. | Subconjunto de R y S. |
| **Diferencia** (Difference) | R − S | Tuplas que están en R pero no en S. | Subconjunto de R. |
| **Producto Cartesiano** (Cartesian Product) | R × S | Todas las combinaciones de una tupla de R con una de S. Esquema concatenado. | |R|·|S| tuplas. |
| **Union Compatible** (Union Compatibilidad) | — | Requisito para ∪, ∩, −: mismo número de atributos y dominios correspondientes compatibles. |

> **Nota:** La intersección y diferencia pueden definirse usando la diferencia y la unión:  
> - R ∩ S = R − (R − S)  
> - R − S ya es primitiva.

### 3.1. Propiedades Algebraicas
- **Conmutatividad**: σ, Π, ∪, × (para × solo con respecto a la concatenación de atributos, no al orden de tuplas).  
- **Asociatividad**: ∪, ∩, −, ×.  
- **Distributividad**: σ sobre ∪, ∩, −; también Π distribuye sobre ∪ (pero con eliminación de duplicados).  
- **Idempotencia**: R ∪ R = R, R ∩ R = R, R − R = ∅.  
- **Absorción**: R ∪ (R ∩ S) = R; R ∩ (R ∪ S) = R.  

Estas propiedades permiten **optimizar consultas** mediante reescritura.

---

## 4. Operaciones Derivadas y Especializadas

### 4.1. Join (Unión Natural)
- **Definición**: Une dos relaciones basado en la igualdad de valores en atributos de mismo nombre (y mismo dominio).  
- **Notación**: R ⋈ S  
- **Definición formal**:  
  `R ⋈ S = Π_{attrs(R) ∪ attrs(S)} ( σ_{A₁ = B₁ ∧ … ∧ A_k = B_k} (R × S) )`  
  donde A_i son atributos comunes de R y S y B_i son los correspondientes en S.

- **Tipos de Join**:
  - **Inner Join** (equi‑join por defecto).  
  - **Left Outer Join** (⟕): conserva todas las tuplas de la izquierda, rellenando con NULL los atributos de la derecha cuando no hay match.  
  - **Right Outer Join** (⟖): análogo para la derecha.  
  - **Full Outer Join** (⟖): conserva ambas partes.  
  - **Semi‑join** (⋉): devuelve tuplas de R que tienen al menos una coincidencia en S (proyección sobre R).  
  - **Anti‑join** (▷): devuelve tuplas de R que **no** tienen coincidencia en S.

### 4.2. Division
- **Definición**: Dadas R (con atributos X ∪ Y) y S (con atributos Y), la división R ÷ S produce aquellas tuplas t sobre X tal que para **cada** tupla s en S, la combinación t ∘ s pertenece a R.  
- **Notación**: R ÷ S.  
- **Uso típico**: consultas de tipo “para todos” (por ejemplo, “aquellos empleados que trabajan en *todos* los proyectos de un departamento”).

### 4.3. Operaciones de Agregación (Extensión)
Aunque el álgebra relacional pura no incluye agregados, los lenguajes prácticos (SQL) los añaden:  
- **SUM, COUNT, AVG, MIN, MAX** con **GROUP BY**.  
- Se modelan mediante una extensión llamada **aggregated relational algebra** (γ).  
  - `γ_{f1(A1)→B1, ..., fm(Am)->Bm}(R)`: agrupa por los atributos no agregados y calcula funciones.

### 4.4. Operaciones de Conjunto Generalizadas
- **Producto Generalizado** (θ‑join): Une bajo una condición arbitraria θ (no solo igualdad).  
  - Notación: `R ⋈_{θ} S`.  
- **Union con Renombrado** (∪₍ᵣ₎): Cuando los atributos tienen nombres diferentes pero mismos dominios, se renombra antes de aplicar ∪.

---

## 5. Ejemplos Concretos

Supongamos el siguiente esquema:

- **Empleado**(eID, nombre, dept, salario)  
- **Proyecto**(pID, nombre, presupuesto)  
- **Asignacion**(eID, pID, horas)

### 5.1. Selección y Proyección
> Obtener los nombres de los empleados del departamento "Ventas" con salario > 3000.

```
Π_nombre ( σ_{dept='Ventas' ∧ salario>3000} (Empleado) )
```

### 5.2. Join Natural
> Lista de empleados y los proyectos a los que están asignados (incluyendo horas).

```
Empleado ⋈ Asignacion ⋈ Proyecto
```

### 5.3. Left Outer Join
> Todos los empleados, incluso aquellos sin asignación, mostrando el proyecto (NULL si no tiene).

```
Empleado ⟕ Asignacion
```

### 5.4. División
> Empleados que están asignados a **todos** los proyectos del departamento "I+D".

1. Obtener proyectos de I+D:  
   `P_I+D = σ_{dept='I+D'} (Proyecto)`  
   (Suponemos que proyecto tiene atributo dept, o usamos otra relación.)

2. División:  
   `Resultado = (π_{eID, pID} (Asignacion)) ÷ (π_{pID} (P_I+D))`  
   Luego se proyecta sobre eID y se une con Empleado para obtener nombres.

### 5.5. Agrupación
> Salario medio por departamento.

```
γ_{AVG(salario)→salario medio}(Empleado) grouped by dept
```
En notación extendida:  
`γ_{dept; AVG(salario)→salario medio}(Empleado)`

---

## 6. Relación con SQL

| Álgebra Relacional | SQL Equivalente (aprox.) |
|--------------------|--------------------------|
| σ<sub>cond</sub>(R) | `SELECT * FROM R WHERE cond` |
| Π<sub>A1,…,Ak</sub>(R) | `SELECT A1, …, Ak FROM R` (con `DISTINCT` implícito) |
| ρ<sub>R'(B1,…,Bn)</sub>(R) | `SELECT … FROM R AS R'` (y renombrar columnas con `AS`) |
| R ∪ S | `SELECT * FROM R UNION SELECT * FROM S` |
| R ∩ S | `SELECT * FROM R INTERSECT SELECT * FROM S` |
| R − S | `SELECT * FROM R EXCEPT SELECT * FROM S` |
| R × S | `SELECT * FROM R, S` (cross join) |
| R ⋈ S | `SELECT * FROM R JOIN S ON R.A = S.A` (equi‑join) |
| R ⟕ S | `SELECT * FROM R LEFT JOIN S ON R.A = S.A` |
| R ÷ S | No hay operador directo; se expresa con `NOT EXISTS` o doble `NOT IN`. |
| γ_{...}(R) | `SELECT ..., aggFunc(...) FROM R GROUP BY ...` |

Los optimizadores de bases de datos traducen consultas SQL a expresiones de álgebra relacional, aplican leyes algebraicas (como empujar selecciones hacia abajo, combinar proyectores, etc.) y luego generan un plan de ejecución.

---

## 7. Propiedades Teóricas y Complejidad

- **Cierre**: Todas las operaciones básicas producen una relación del mismo tipo (conjunto finito de tuplas sobre dominios).  
- **Expresividad**: El álgebra relacional es **equivalente en poder expresivo** al cálculo relacional de dominio finito y, por tanto, al subconjunto **seguro** de la lógica de primer orden (FOL).  
- **Complejidad de la evaluación**:  
  - Selección y proyección son **lineales** en el tamaño de la entrada (con índices pueden ser sub‑lineales).  
  - Producto cartesiano es **cuadrático** (|R|·|S|) sin optimizaciones; los joins se optimizan mediante algoritmos de hash join, merge join o índice nested loop.  
  - La división puede ser costosa; típicamente se reescribe mediante combinación de diferencia y协同 (anti‑join).  
- **Dependencia de los esquemas**: el resultado de una operación sólo depende de los valores, no del orden de las tuplas (las relaciones son conjuntos, no secuencias).

---

## 8. Extensiones y Variantes

| Extensión | Descripción | Comentario |
|-----------|-------------|------------|
| **Álgebra Temporal** | Añade operadores para manejar datos que varían en el tiempo (e.g., secuenciación, ventana deslizante). | Usada en bases de datos temporales y de series de tiempo. |
| **Álgebra de Probabilidades** | Operaciones sobre relaciones probabilísticas (tuplas con probabilidad). | Aparece en modelos de datos imprecisos. |
| **Álgebra de Grafos (GraphQL-like)** | Extiende con operaciones de recorrido (path, cierre transtivo). | Base de lenguajes como GQL o PathQL. |
| **Álgebra con Nulled Values** | Introduce la lógica de tres valores (Verdadero, Falso, Desconocido) para manejar NULL. | Refleja la semántica de SQL con `NULL`. |
| **Álgebra con Restricciones** | Incorpora restricciones de integridad (claves foráneas, unicidad) como operadores de verificación. | Utilizado en sistemas de verificación de esquema. |

---

## 9. Buenas Prácticas al Diseñar Consultas en Álgebra Relacional

1. **Aplicar selecciones lo antes posible** (push‑down) para reducir el tamaño de las relaciones intermedias.  
2. **Proyectar temprano** cuando solo se necesitan ciertos atributos, evitando llevar columnas innecesarias a través de joins costosos.  
3. **Usar joins apropiados**: prefiera **equi‑joins** con índices; evite productos cartesianos innecesarios.  
4. **Materializar resultados intermedios** solo cuando sea beneficioso (p. ej., cuando una subconsulta se reutiliza múltiples veces).  
5. **Considerar la propiedad de conmutatividad y asociatividad** para reordenar operaciones y mejorar el uso de índices.  
6. **Eliminar duplicados solo cuando sea necesario**; el operador de proyección (*Π*) ya elimina duplicados, pero al usar unión (`∪`) quizás quiera mantenerlos con `UNION ALL` en SQL.  
7. **Para divisiones**, reescriba usando `NOT EXISTS` o `LEFT JOIN … WHERE … IS NULL` para que el optimizador pueda aprovechar índices.  
8. **Documente las condiciones de unión** (theta-join) explícitamente cuando la condición no sea igualdad; esto ayuda al planificador a elegir el algoritmo correcto.  

---

## 10. Conclusión

El álgebra relacional constituye el **corazón teórico** detrás de los sistemas de gestión de bases de datos modernos. Aunque su forma pura es prototípica (conjuntos, operaciones básicas), sus extensiones (outer joins, división, agregaciones) y sus propiedades algebraicas permiten representar prácticamente cualquier consulta que se pueda expresar en SQL. Comprender estas operaciones, sus equivalencias y sus características de rendimiento es esencial para:

- **Diseñar consultas eficientes** y ayudar al optimizador a elegir el mejor plan.  
- **Entender las limitaciones** del modelo relacional (por ejemplo, la dificultad de expresar ciertas consultas de cierre transitivo sin récursion sin extensiones).  
- **Aplicar conceptos a nuevos paradigmas** (bases de datos temporales, probabilísticas, de grafos) mediante extensiones del álgebra.  

Dominar el álgebra relacional brinda a desarrolladores, analistas y administradores de bases de datos una base sólida para razonar sobre los datos de manera formal y para traducir necesidades de negocio a consultas eficientes y correctas.

--- 

*Fin del documento.*