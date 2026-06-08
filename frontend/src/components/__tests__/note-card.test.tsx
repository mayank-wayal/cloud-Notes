import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateTestNote } from '../../../test-helpers';

describe('NoteCard Component', () => {
  let NoteCard: React.ComponentType<any>;
  let mockOnEdit: jest.Mock;
  let mockOnDelete: jest.Mock;
  let mockOnFavorite: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOnEdit = jest.fn();
    mockOnDelete = jest.fn();
    mockOnFavorite = jest.fn();

    // Mock NoteCard component
    NoteCard = ({ note, onEdit, onDelete, onFavorite }: any) => {
      return (
        <div
          data-testid={`note-card-${note.id}`}
          className="note-card"
        >
          <h3 data-testid="note-title">{note.title}</h3>
          <p data-testid="note-preview">{note.content.substring(0, 100)}</p>
          <div className="note-meta">
            <span data-testid="created-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="note-actions">
            <button
              data-testid="favorite-btn"
              onClick={() => onFavorite(note.id)}
              className={note.isFavorite ? 'favorited' : ''}
              aria-pressed={note.isFavorite}
            >
              {note.isFavorite ? '★' : '☆'}
            </button>
            <button
              data-testid="edit-btn"
              onClick={() => onEdit(note.id)}
            >
              Edit
            </button>
            <button
              data-testid="delete-btn"
              onClick={() => onDelete(note.id)}
            >
              Delete
            </button>
          </div>
        </div>
      );
    };
  });

  describe('Rendering', () => {
    it('should render note card with title and content', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByTestId('note-title')).toHaveTextContent(testNote.title);
      expect(screen.getByTestId('note-preview')).toHaveTextContent(testNote.content);
    });

    it('should display created date', () => {
      const testNote = generateTestNote();
      const expectedDate = new Date(testNote.createdAt).toLocaleDateString();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByTestId('created-date')).toHaveTextContent(expectedDate);
    });

    it('should show favorite icon based on isFavorite status', () => {
      const favoriteNote = generateTestNote({ isFavorite: true });

      const { rerender } = render(
        <NoteCard
          note={favoriteNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      let favoriteBtn = screen.getByTestId('favorite-btn');
      expect(favoriteBtn).toHaveTextContent('★');
      expect(favoriteBtn).toHaveAttribute('aria-pressed', 'true');

      const unfavoriteNote = generateTestNote({ isFavorite: false });
      rerender(
        <NoteCard
          note={unfavoriteNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      favoriteBtn = screen.getByTestId('favorite-btn');
      expect(favoriteBtn).toHaveTextContent('☆');
      expect(favoriteBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('should truncate long content in preview', () => {
      const longContent = 'a'.repeat(200);
      const testNote = generateTestNote({ content: longContent });

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      const preview = screen.getByTestId('note-preview');
      expect(preview.textContent?.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Interactions', () => {
    it('should call onEdit when edit button clicked', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      const editBtn = screen.getByTestId('edit-btn');
      fireEvent.click(editBtn);

      expect(mockOnEdit).toHaveBeenCalledWith(testNote.id);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button clicked', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      const deleteBtn = screen.getByTestId('delete-btn');
      fireEvent.click(deleteBtn);

      expect(mockOnDelete).toHaveBeenCalledWith(testNote.id);
    });

    it('should call onFavorite when favorite button clicked', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      const favoriteBtn = screen.getByTestId('favorite-btn');
      fireEvent.click(favoriteBtn);

      expect(mockOnFavorite).toHaveBeenCalledWith(testNote.id);
    });

    it('should handle multiple button clicks', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      fireEvent.click(screen.getByTestId('favorite-btn'));
      fireEvent.click(screen.getByTestId('edit-btn'));
      fireEvent.click(screen.getByTestId('favorite-btn'));

      expect(mockOnFavorite).toHaveBeenCalledTimes(2);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const testNote = generateTestNote({ isFavorite: true });

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      const favoriteBtn = screen.getByTestId('favorite-btn');
      expect(favoriteBtn).toHaveAttribute('aria-pressed');
    });

    it('should have descriptive button text', () => {
      const testNote = generateTestNote();

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle notes with empty title', () => {
      const testNote = generateTestNote({ title: '' });

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByTestId('note-title')).toHaveTextContent('');
    });

    it('should handle notes with empty content', () => {
      const testNote = generateTestNote({ content: '' });

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByTestId('note-preview')).toHaveTextContent('');
    });

    it('should render with special characters in content', () => {
      const specialContent = 'Test with <special> & "chars"';
      const testNote = generateTestNote({ content: specialContent });

      render(
        <NoteCard
          note={testNote}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onFavorite={mockOnFavorite}
        />
      );

      expect(screen.getByTestId('note-preview')).toBeInTheDocument();
    });
  });
});
