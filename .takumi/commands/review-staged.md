Review staged changes and provide detailed code review suggestions.

## Process:

1. **Analyze Changes**: 
   - Review the staged changes using `git --no-pager diff --cached -- . ':!pnpm-lock.yaml'`
   - Examine modified files for code quality, security, and best practices
   - Check for potential bugs, performance issues, or breaking changes
2. **Provide Feedback**:
   - Highlight positive aspects of the implementation
   - Identify areas for improvement with specific suggestions
   - Note any security concerns or potential vulnerabilities
   - Recommend optimizations or alternative approaches where applicable
   - Verify adherence to project coding standards and conventions

## Review Focus Areas:
- Code quality and maintainability
- Security vulnerabilities
- Performance implications
- Test coverage
- Documentation completeness
- Breaking changes
- Consistency with codebase patterns
