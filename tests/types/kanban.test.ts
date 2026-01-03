/**
 * Kanban Type Tests
 * TDD test suite for Kanban column definitions and type mappings
 */
import { describe, it, expect } from 'vitest';
import {
  KANBAN_COLUMNS,
  type KanbanColumnDef,
  type TaskStatus,
  getColumnIndex,
  getNextStatus,
  getPreviousStatus,
  isForwardMovement,
} from '../../src/types/kanban';

describe('Kanban Types', () => {
  describe('KANBAN_COLUMNS', () => {
    it('should have exactly 4 columns', () => {
      expect(KANBAN_COLUMNS).toHaveLength(4);
    });

    it('should have columns in correct order', () => {
      expect(KANBAN_COLUMNS[0].id).toBe('featurelist');
      expect(KANBAN_COLUMNS[1].id).toBe('design');
      expect(KANBAN_COLUMNS[2].id).toBe('prd');
      expect(KANBAN_COLUMNS[3].id).toBe('prototype');
    });

    it('should have correct display titles', () => {
      expect(KANBAN_COLUMNS[0].title).toBe('Feature List');
      expect(KANBAN_COLUMNS[1].title).toBe('Design Doc');
      expect(KANBAN_COLUMNS[2].title).toBe('PRD');
      expect(KANBAN_COLUMNS[3].title).toBe('Prototype');
    });

    it('should have triggerAI set correctly for each column', () => {
      // featurelist is first column, no AI trigger needed
      expect(KANBAN_COLUMNS[0].triggerAI).toBe(false);
      // design, prd, prototype columns should trigger AI when moved forward
      expect(KANBAN_COLUMNS[1].triggerAI).toBe(true);
      expect(KANBAN_COLUMNS[2].triggerAI).toBe(true);
      expect(KANBAN_COLUMNS[3].triggerAI).toBe(true);
    });

    it('each column should have required properties', () => {
      KANBAN_COLUMNS.forEach((column: KanbanColumnDef) => {
        expect(column).toHaveProperty('id');
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('triggerAI');
        expect(typeof column.id).toBe('string');
        expect(typeof column.title).toBe('string');
        expect(typeof column.triggerAI).toBe('boolean');
      });
    });
  });

  describe('getColumnIndex', () => {
    it('should return correct index for featurelist', () => {
      expect(getColumnIndex('featurelist')).toBe(0);
    });

    it('should return correct index for design', () => {
      expect(getColumnIndex('design')).toBe(1);
    });

    it('should return correct index for prd', () => {
      expect(getColumnIndex('prd')).toBe(2);
    });

    it('should return correct index for prototype', () => {
      expect(getColumnIndex('prototype')).toBe(3);
    });

    it('should return -1 for invalid status', () => {
      expect(getColumnIndex('invalid' as TaskStatus)).toBe(-1);
    });
  });

  describe('getNextStatus', () => {
    it('should return design for featurelist', () => {
      expect(getNextStatus('featurelist')).toBe('design');
    });

    it('should return prd for design', () => {
      expect(getNextStatus('design')).toBe('prd');
    });

    it('should return prototype for prd', () => {
      expect(getNextStatus('prd')).toBe('prototype');
    });

    it('should return null for prototype (last column)', () => {
      expect(getNextStatus('prototype')).toBeNull();
    });
  });

  describe('getPreviousStatus', () => {
    it('should return null for featurelist (first column)', () => {
      expect(getPreviousStatus('featurelist')).toBeNull();
    });

    it('should return featurelist for design', () => {
      expect(getPreviousStatus('design')).toBe('featurelist');
    });

    it('should return design for prd', () => {
      expect(getPreviousStatus('prd')).toBe('design');
    });

    it('should return prd for prototype', () => {
      expect(getPreviousStatus('prototype')).toBe('prd');
    });
  });

  describe('isForwardMovement', () => {
    it('should return true when moving from featurelist to design', () => {
      expect(isForwardMovement('featurelist', 'design')).toBe(true);
    });

    it('should return true when moving from design to prd', () => {
      expect(isForwardMovement('design', 'prd')).toBe(true);
    });

    it('should return true when moving from prd to prototype', () => {
      expect(isForwardMovement('prd', 'prototype')).toBe(true);
    });

    it('should return true when moving from featurelist to prototype (skip)', () => {
      expect(isForwardMovement('featurelist', 'prototype')).toBe(true);
    });

    it('should return false when moving from design to featurelist', () => {
      expect(isForwardMovement('design', 'featurelist')).toBe(false);
    });

    it('should return false when moving from prototype to prd', () => {
      expect(isForwardMovement('prototype', 'prd')).toBe(false);
    });

    it('should return false when moving to same status', () => {
      expect(isForwardMovement('design', 'design')).toBe(false);
    });
  });
});
