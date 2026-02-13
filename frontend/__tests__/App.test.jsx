import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from '../src/App.jsx';

const mockResponse = (body, ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  });

const todoItem1 = { id: 1, title: 'First todo', done: false, comments: [] };
const todoItem2 = {
  id: 2,
  title: 'Second todo',
  done: false,
  comments: [
    { id: 1, message: 'First comment' },
    { id: 2, message: 'Second comment' },
  ],
};

const originalTodoList = [todoItem1, todoItem2];

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      mockResponse(originalTodoList)
    );

    render(<App />);

    expect(await screen.findByText('First todo')).toBeInTheDocument();
    expect(await screen.findByText('Second todo')).toBeInTheDocument();
    expect(await screen.findByText('First comment')).toBeInTheDocument();
    expect(await screen.findByText('Second comment')).toBeInTheDocument();
  });
  it('toggles done on a todo item', async () => {
    const toggledTodoItem1 = { ...todoItem1, done: true };
  
    global.fetch
      .mockImplementationOnce(() => mockResponse(originalTodoList))
      .mockImplementationOnce(() => mockResponse(toggledTodoItem1));
  
    render(<App />);
  
    // ก่อน toggle ยังไม่ done
    expect(await screen.findByText('First todo')).not.toHaveClass('done');
  
    const toggleButtons = await screen.findAllByRole('button', { name: /toggle/i });
    await userEvent.click(toggleButtons[0]);
  
    // หลัง toggle ต้อง done
    expect(await screen.findByText('First todo')).toHaveClass('done');
  });
});