---
description: Core rules for C# development and tooling
globs: *.cs,*.csproj,*.sln,Directory.Packages.props,global.json,dotnet-tools.json
alwaysApply: false
---
# Backend

Carefully follow these instructions for C# backend development, including code style, naming, exceptions, logging, and build/test/format workflow.

## Code Style

- Always use these C# features:
  - Top-level namespaces.
  - Primary constructors.
  - Collection initializers.
  - Pattern matching with `is null` and `is not null` instead of `== null` and `!= null`.
- Records for immutable types.
- Use the most fitting generic collections
- Mark all C# types as sealed.
- Use `var` when possible.
- Use simple collection types like `UserId[]` instead of `List<UserId>` whenever possible.
- Use clear names instead of making comments.
- Never use acronyms. E.g., use `SharedAccessSignature` instead of `Sas`.
- Do **not** prefix private fields with `_`. Use `camelCase` for private fields (e.g., `private readonly ITracingService tracingService;`). Follow the existing codebase conventions for field naming.
- Avoid using exceptions for control flow:
  - When exceptions are thrown, always use meaningful exceptions following .NET conventions.
  - Exception messages should include a period.
- Log only meaningful events at appropriate severity levels.
  - Logging messages should not include a period.
  - Use structured logging.
- Never introduce new NuGet dependencies.
- Don't do defensive coding (e.g., do not add exception handling to handle situations we don't know will happen).
- Do not add null checks for plugin context Target entities unless there is a documented scenario where Target may be missing. The framework guarantees the presence of the Target for the registered entity and operation.
- Avoid try-catch unless we cannot fix the reason. We have global exception handling to handle unknown exceptions.
- Don't add comments unless the code is truly not expressing the intent.
- Never add XML comments.
- Prefer constructor dependency injection for dependency management. Only deviate from this when applying a strategy + factory pattern.
- Always use named tuple elements in the return type. Name the elements using PascalCasing.
- When deconstructing tuple returns, always use explicit variable names in the assignment, e.g., `var (fromAttr, toAttr) = ...;`.
- There must be a blank line after the last method in a class, but no blank line before the final closing brace of the class or namespace.
- Use switch expressions over nested ternary operators.

## Using Directives and Type References

- Do not remove a `using` directive unless you have confirmed that all types in the file remain resolvable and a full build (Debug and Release) succeeds without it.
- Before saving changes, explicitly check that all types used in the file (including generic constraints like `where TEntity : Entity`) have the correct `using` directives present. For example, if `Entity` or `IOrganizationService` is referenced, ensure `using Microsoft.Xrm.Sdk;` is included.
- When using types provided by NuGet packages (including transitive dependencies), always ensure the correct `using` directive is present, even if the type is available via a transitive reference.

## Analyzer and Style Rules

- Treat all analyzer and style warnings as build-breaking errors. All code changes must be validated against the full set of analyzers and style rules configured for the project. Any warning or suggestion that is treated as an error in the build must be fixed before considering the build successful.
- Before submitting a fix, check for and resolve all code style and analyzer errors, including:
  - Method length (e.g., MA0051)
  - Blank lines and brace placement (e.g., SA1505, SA1507, SA1516)
  - Unnecessary using directives (e.g., IDE0005)
  - Static method suggestions (e.g., CA1822)

## Build Validation

- After any code or rule change, a Release build must be performed and must succeed with zero errors before the change is accepted.

## Implementation

IMPORTANT: Always follow these steps very carefully when implementing changes:

1. Always start new changes by writing new test cases (or change existing tests).
2. Build and test your changes:
   - Always run `dotnet build --configuration Release` to build the backend in release mode.
   - Run `dotnet test --configuration Release` to run all tests.
3. Format the code by running `dotnet format`. This will format the code according to the .editorconfig file.
