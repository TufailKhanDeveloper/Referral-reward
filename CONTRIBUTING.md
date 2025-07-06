# 🤝 Contributing to Referral Rewards System

Thank you for your interest in contributing to the Referral Rewards System! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### Code Contributions
- **Bug fixes** - Help us identify and fix issues
- **Feature development** - Implement new functionality
- **Performance improvements** - Optimize existing code
- **Security enhancements** - Strengthen system security
- **Documentation** - Improve guides and documentation

### Non-Code Contributions
- **Bug reports** - Report issues you encounter
- **Feature requests** - Suggest new functionality
- **Documentation improvements** - Help make docs clearer
- **Testing** - Help test new features and releases
- **Community support** - Help other users in discussions

## 🚀 Getting Started

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/referral-rewards-system.git
cd referral-rewards-system
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 3. Create a Branch
```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

## 📝 Development Guidelines

### Code Style

#### TypeScript/JavaScript
```typescript
// Use TypeScript for all new code
interface UserData {
  address: string;
  referralCode: string;
}

// Use meaningful variable names
const userReferralCode = generateReferralCode(userAddress);

// Add JSDoc comments for functions
/**
 * Processes a referral and distributes rewards
 * @param referralCode - The referral code to process
 * @returns Promise resolving to success status
 */
async function processReferral(referralCode: string): Promise<boolean> {
  // Implementation
}
```

#### React Components
```typescript
// Use functional components with hooks
const ReferralInput: React.FC<Props> = ({ onSubmit }) => {
  const [code, setCode] = useState('');
  
  // Use meaningful prop names and types
  interface Props {
    onSubmit: (code: string) => void;
    disabled?: boolean;
  }
  
  return (
    <div className="referral-input">
      {/* Component JSX */}
    </div>
  );
};
```

#### Solidity
```solidity
// Follow Solidity style guide
contract ReferralSystem {
    // Use descriptive variable names
    mapping(address => uint256) public lastReferralTime;
    
    // Add comprehensive comments
    /**
     * @dev Process a referral and distribute rewards
     * @param _referee Address of the referee (new user)
     * @param _referrer Address of the referrer (existing user)
     */
    function processReferral(
        address _referee,
        address _referrer
    ) external nonReentrant whenNotPaused {
        // Implementation
    }
}
```

### Testing Requirements

#### Frontend Tests
```typescript
// Write tests for all new components
describe('ReferralInput', () => {
  it('should validate referral codes correctly', () => {
    const { getByRole } = render(<ReferralInput />);
    const input = getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'REF_123456' } });
    expect(input).toHaveValue('REF_123456');
  });
});
```

#### Smart Contract Tests
```solidity
// Test all contract functions
contract ReferralSystemTest {
    function testReferralProcessing() public {
        // Setup
        address referee = address(0x1);
        address referrer = address(0x2);
        
        // Execute
        referralSystem.processReferral(referee, referrer);
        
        // Assert
        assertTrue(referralSystem.hasBeenReferred(referee));
    }
}
```

### Commit Guidelines

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
feat(referral): add QR code generation for referral links

- Implement QR code generation using qrcode library
- Add download functionality for generated QR codes
- Update UI with QR code modal

fix(wallet): resolve connection issues on network switch

- Fix wallet reconnection after network change
- Add proper error handling for network switches
- Update connection status indicators

docs(readme): update deployment instructions

- Add step-by-step Remix deployment guide
- Include troubleshooting section
- Update environment variable examples
```

## 🐛 Bug Reports

### Before Submitting
1. **Search existing issues** to avoid duplicates
2. **Test on latest version** to ensure bug still exists
3. **Gather information** about your environment

### Bug Report Template
```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 95, Firefox 94]
- Wallet: [e.g., MetaMask 10.5.0]
- Network: [e.g., Sepolia Testnet]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
A clear description of the feature you'd like to see.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Add any other context or screenshots about the feature request.
```

## 🔍 Code Review Process

### Submitting Pull Requests

#### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated if needed
- [ ] Commit messages follow guidelines
- [ ] PR description explains changes clearly

#### PR Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### Review Process
1. **Automated checks** run on all PRs
2. **Code review** by maintainers
3. **Testing** on development environment
4. **Approval** and merge by maintainers

## 🏗️ Development Workflow

### Branch Strategy
```
main                    # Production-ready code
├── develop            # Integration branch
├── feature/xyz        # Feature development
├── fix/abc           # Bug fixes
└── hotfix/urgent     # Critical fixes
```

### Release Process
1. **Feature development** on feature branches
2. **Integration testing** on develop branch
3. **Release preparation** and testing
4. **Merge to main** and tag release
5. **Deploy** to production

## 🧪 Testing Guidelines

### Test Categories

#### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Fast execution and isolated

#### Integration Tests
- Test component interactions
- Test API integrations
- Test smart contract interactions

#### End-to-End Tests
- Test complete user workflows
- Test across different browsers
- Test mobile responsiveness

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ReferralInput.test.tsx

# Run tests in watch mode
npm test -- --watch
```

## 📚 Documentation Standards

### Code Documentation
```typescript
/**
 * Processes a referral code and distributes rewards
 * 
 * @param referralCode - The referral code to process (format: REF_XXXXXX)
 * @param userAddress - The address of the user using the code
 * @returns Promise that resolves to true if successful, false otherwise
 * 
 * @throws {Error} When referral code is invalid
 * @throws {Error} When user has already been referred
 * 
 * @example
 * ```typescript
 * const success = await processReferral('REF_ABC123', '0x123...');
 * if (success) {
 *   console.log('Referral processed successfully');
 * }
 * ```
 */
async function processReferral(
  referralCode: string, 
  userAddress: string
): Promise<boolean> {
  // Implementation
}
```

### README Updates
- Keep installation instructions current
- Update feature lists when adding functionality
- Include new configuration options
- Add troubleshooting for common issues

## 🔒 Security Guidelines

### Security Considerations
- **Never commit private keys** or sensitive data
- **Validate all inputs** on both frontend and smart contracts
- **Use established libraries** for cryptographic operations
- **Follow smart contract best practices** (reentrancy protection, etc.)
- **Test security features** thoroughly

### Reporting Security Issues
- **Do not** create public issues for security vulnerabilities
- **Email** security issues to [security@example.com]
- **Include** detailed description and reproduction steps
- **Wait** for confirmation before public disclosure

## 🎯 Performance Guidelines

### Frontend Performance
- **Minimize re-renders** with proper memoization
- **Optimize bundle size** with code splitting
- **Use efficient algorithms** for data processing
- **Implement lazy loading** for large components

### Smart Contract Performance
- **Optimize gas usage** in all functions
- **Use efficient data structures** (packed structs, etc.)
- **Minimize storage operations** where possible
- **Batch operations** when appropriate

## 🌍 Community Guidelines

### Code of Conduct
- **Be respectful** and inclusive
- **Help others** learn and grow
- **Provide constructive feedback**
- **Focus on the code**, not the person
- **Assume good intentions**

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code review and discussion
- **Discord** - Real-time community chat (if available)

## 📋 Contributor Recognition

### Types of Recognition
- **Contributor list** in README
- **Release notes** mention significant contributions
- **Special badges** for major contributors
- **Maintainer status** for consistent contributors

### Becoming a Maintainer
1. **Consistent contributions** over time
2. **High-quality code** and reviews
3. **Community involvement** and support
4. **Understanding** of project goals and architecture
5. **Invitation** from existing maintainers

## 📞 Getting Help

### Resources
- **Documentation** - Check existing docs first
- **GitHub Issues** - Search for similar problems
- **GitHub Discussions** - Ask questions and get help
- **Code Examples** - Look at existing implementations

### Contact Information
- **General Questions** - GitHub Discussions
- **Bug Reports** - GitHub Issues
- **Security Issues** - security@example.com
- **Maintainer Contact** - maintainers@example.com

---

Thank you for contributing to the Referral Rewards System! Your contributions help make Web3 more accessible and user-friendly for everyone. 🚀