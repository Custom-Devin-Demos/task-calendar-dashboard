// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn(),
  },
}));

jest.mock('antd/lib/grid/hooks/useBreakpoint', () => ({
  __esModule: true,
  default: () => ({
    xs: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  }),
}));

jest.mock('antd', () => {
  const originalAntd = jest.requireActual('antd');
  
  const MockListItem = ({ children, actions, ...props }) => (
    <div data-testid="list-item-content" {...props}>
      <div>{children}</div>
      {actions && (
        <div data-testid="list-item-actions">
          {actions.map((action, index) => (
            <span key={index}>{action}</span>
          ))}
        </div>
      )}
    </div>
  );

  const MockList = ({ dataSource = [], renderItem, bordered, ...props }) => {
    const safeDataSource = Array.isArray(dataSource) ? dataSource : [];
    return (
      <div data-testid="mocked-list" {...props}>
        {safeDataSource.map((item, index) => (
          <div key={item.id || index} data-testid="list-item">
            {renderItem ? renderItem(item) : null}
          </div>
        ))}
      </div>
    );
  };

  MockList.Item = MockListItem;

  const MockSelect = ({ children, onChange, value, ...props }) => (
    <select 
      data-testid="mocked-select" 
      value={value || ''} 
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    >
      <option value="">Select category</option>
      <option value="success">success</option>
      <option value="warning">warning</option>
      <option value="error">error</option>
      <option value="info">info</option>
      {children}
    </select>
  );

  MockSelect.Option = ({ children, value, ...props }) => (
    <option value={value} {...props}>{children}</option>
  );

  return {
    ...originalAntd,
    List: MockList,
    Select: MockSelect,
  };
});
