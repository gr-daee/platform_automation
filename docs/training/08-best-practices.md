# 08 - Best Practices

**Estimated Time**: 1 hour

**Prerequisites**: All previous training modules

---

## Learning Objectives

- ✅ Avoid common anti-patterns
- ✅ Follow quality gates
- ✅ Maintain framework health
- ✅ Contribute to framework improvements

---

## Anti-Patterns to Avoid

### ❌ NEVER Do This

```typescript
// ❌ CSS class selectors (Tailwind classes change)
await page.locator('.bg-red-500').click();

// ❌ Native select on Radix components
await page.selectOption('select', 'value');

// ❌ Hardcoded test data
const dealer = await executeQuery('SELECT * FROM dealers WHERE id = 123');

// ❌ Skip documentation updates

// ❌ Create tests without reading module knowledge

// ❌ Duplicate step definitions

// ❌ Forget AUTO_QA_ prefix for test data
```

### ✅ ALWAYS Do This

```typescript
// ✅ Semantic locators
await page.getByRole('button', { name: 'Submit' }).click();

// ✅ Component library for ShadCN/Radix
await selectComponent.selectByLabel('Category', 'Electronics');

// ✅ TestDataLocator for stable data
const dealer = await TestDataLocator.getStableDealer();

// ✅ Update documentation immediately

// ✅ Read module knowledge before creating tests

// ✅ Reuse shared steps

// ✅ Prefix transactional test data
const indentName = `AUTO_QA_${Date.now()}_Indent`;
```

---

## Quality Gates

### Before Committing

- [ ] Test passes consistently (run 3 times)
- [ ] No linter errors
- [ ] Documentation updated
- [ ] Follows all patterns from automation-patterns.mdc
- [ ] No hardcoded test data
- [ ] Semantic locators used
- [ ] Component library used for ShadCN/Radix

### Before PR

- [ ] All tests pass in production mode
- [ ] Allure report generated successfully
- [ ] No flaky tests (run 5 times)
- [ ] Module knowledge updated
- [ ] Test cases documented
- [ ] Gap analysis updated

---

## Framework Maintenance

### Regular Tasks

**Weekly**:
- Review flaky tests
- Update TestDataLocator if stable data changes
- Check for duplicate tests

**Monthly**:
- Update dependencies
- Review and refactor Page Objects
- Update documentation

**Quarterly**:
- Framework health check
- Performance optimization
- Training material updates

---

## Contributing to Framework

### How to Contribute

1. **Identify Improvement**: Notice a pattern that could be reused
2. **Propose Change**: Discuss with team
3. **Implement**: Create PR with changes
4. **Document**: Update documentation
5. **Train**: Share knowledge with team

### Areas for Contribution

- New component library patterns
- Improved TestDataLocator methods
- Better error handling
- Performance optimizations
- Documentation improvements

---

## Success Indicators

You're doing it right when:
- ✅ Tests pass consistently (no flakiness)
- ✅ POMs inherit from BasePage
- ✅ Step definitions use Sandwich Method
- ✅ Documentation updated immediately
- ✅ Semantic locators used consistently
- ✅ Test data uses AUTO_QA_ prefix
- ✅ Shared steps reused
- ✅ Tests run reliably in all modes

---

## Continuous Learning

### Next Steps

1. **Create your first test** under supervision
2. **Review PRs** from other team members
3. **Update documentation** as you learn
4. **Contribute to framework** improvements
5. **Mentor new team members** when ready

### Resources

**Framework Documentation**:
- `docs/framework-enhancements/README.md`
- `docs/knowledge-base/`

**Cursor Rules**:
- `.cursor/rules/sr-automation-engineer-persona.mdc`
- `.cursor/rules/automation-patterns.mdc`
- `.cursor/rules/framework-workflows.mdc`

---

## Congratulations! 🎉

You've completed the DAEE Platform Automation training!

**You are now ready to**:
- Create tests independently
- Debug failures effectively
- Follow best practices
- Contribute to framework improvements

**Keep learning, keep improving!** 🚀

---

## Quick Reference

**Anti-Patterns**:
- ❌ CSS class selectors
- ❌ Hardcoded test data
- ❌ Skip documentation
- ❌ Duplicate steps

**Best Practices**:
- ✅ Semantic locators
- ✅ TestDataLocator
- ✅ Update documentation
- ✅ Reuse shared steps
- ✅ AUTO_QA_ prefix
- ✅ Component library
- ✅ Sandwich Method

**Quality Gates**:
- Test passes consistently
- No linter errors
- Documentation updated
- Follows patterns
