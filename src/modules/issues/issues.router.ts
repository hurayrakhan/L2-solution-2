import { Router } from 'express';
import { IssuesController } from './issues.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateCreateIssue, validateUpdateIssue } from '../../middleware/validate';

const router = Router();

router.post('/', authenticate, validateCreateIssue, IssuesController.createIssue);
router.get('/', IssuesController.getAllIssues);
router.get('/:id', IssuesController.getIssueById);
router.patch('/:id', authenticate, validateUpdateIssue, IssuesController.updateIssue);
router.delete('/:id', authenticate, authorize(['maintainer']), IssuesController.deleteIssue);

export default router;
