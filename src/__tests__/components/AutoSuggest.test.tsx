import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AutoSuggest from '../../components/AutoSuggest';

jest.mock('../../components/AutoSuggest.css', () => ({}));

describe('AutoSuggest', () => {
  test('renders null when not visible', () => {
    render(
      <AutoSuggest
        suggestions={['meter']}
        onSelect={() => {}}
        visible={false}
      />
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  test('renders suggestions and handles click', () => {
    const suggestions = ['meter', 'metre', 'm'];
    const onSelect = jest.fn();

    render(
      <AutoSuggest
        suggestions={suggestions}
        onSelect={onSelect}
        visible={true}
      />
    );

    const items = screen.getAllByRole('option');
    expect(items).toHaveLength(3);

    fireEvent.mouseDown(items[1]);
    expect(onSelect).toHaveBeenCalledWith('metre');
  });

  test('highlights activeIndex', () => {
    const suggestions = ['meter', 'foot'];
    render(
      <AutoSuggest
        suggestions={suggestions}
        onSelect={() => {}}
        activeIndex={1}
      />
    );

    const items = screen.getAllByRole('option');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
  });
});
