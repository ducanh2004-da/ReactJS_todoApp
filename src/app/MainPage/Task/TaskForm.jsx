import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { gql } from '@apollo/client';
import { client } from '../../../graphql/client';
import { AuthVar } from '../../Auth/AuthVar';
import toast, { Toaster } from 'react-hot-toast';
import dayjs from 'dayjs';

// MUI
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function TaskForm({ editId = null, open = false, totalTag, onClose, rows = [], onTaskChange }) {
    const theme = useTheme();

    // UI state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');
    const [tag,setTag] = useState(null);

    // form state
    const [formValues, setFormValues] = useState({ title: '', description: '' });
    const [dueAt, setDueAt] = useState(dayjs());
    const [status, setStatus] = useState('IN_PROGRESS'); // single status select

    // GraphQL mutations
    const ADD_TASK = gql`
    mutation AddTask($title: String!, $description: String!, $dueAt: DateTime!, $userId: Float!, $status: TaskStatus, $tag: String!) {
      addTask(userId: $userId, data: { title: $title, dueAt: $dueAt, description: $description, status: $status, tags: [$tag] }) {
        message
        data {
          id
          title
          description
          dueAt
          status
          tags { title }
        }
      }
    }
  `;

    const EDIT_TASK = gql`
    mutation EditTask($id: Float!, $title: String!, $description: String!, $dueAt: DateTime!, $status: TaskStatus, $tag: String!) {
      editTask(id: $id, data: { title: $title, description: $description, dueAt: $dueAt, status: $status , tags: [$tag] }) {
        message
        data {
          id
          title
          description
          dueAt
          status
          tags { title }
        }
      }
    }
  `;

    // Keep internal dialogOpen in sync with parent `open`
    useEffect(() => {
        setDialogOpen(Boolean(open));

        if (open) {
            // prefilling when dialog opens
            if (editId) {
                const editTask = rows?.find((r) => String(r.id) === String(editId));
                if (editTask) {
                    setFormValues({ title: editTask.title || '', description: editTask.description || '' });
                    setDueAt(editTask.dueAt ? dayjs(editTask.dueAt) : dayjs());
                    setStatus(editTask.status || 'IN_PROGRESS');
                }
            } else {
                setFormValues({ title: '', description: '' });
                setDueAt(dayjs());
                setStatus('IN_PROGRESS');
            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editId, rows]);

    const handleLocalClose = () => {
        setDialogOpen(false);
        if (onClose) onClose();
    };

    const handleInfoClose = () => setInfoOpen(false);

    // form handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };
    const handleTagChange = (e) => {
        setTag(e.target.value);
    }

    const validate = () => {
        if (!formValues.title || !formValues.title.trim()) {
            toast.error('Title is required');
            return false;
        }
        // add more validations if necessary
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError(null);

        try {
            const dueAtIso = dueAt ? dayjs(dueAt).toISOString() : dayjs().toISOString();
            let res;
            if (editId) {
                res = await client.mutate({
                    mutation: EDIT_TASK,
                    variables: {
                        id: Number(editId),
                        title: formValues.title,
                        description: formValues.description,
                        dueAt: dueAtIso,
                        status,
                        tag: tag
                    },
                });

                const payload = res?.data?.editTask;
                if (payload?.data) {
                    toast.success(payload.message || 'Task updated');
                    setResult(payload.data);
                    setMessage(payload.message || 'Updated');
                } else {
                    toast.error(payload?.message || 'Update failed');
                }
            } else {
                res = await client.mutate({
                    mutation: ADD_TASK,
                    variables: {
                        userId: Number(AuthVar.userId),
                        title: formValues.title,
                        description: formValues.description,
                        dueAt: dueAtIso,
                        status,
                        tag: tag
                    },
                });

                const payload = res?.data?.addTask;
                if (payload?.data) {
                    toast.success(payload.message || 'Task created');
                    setResult(payload.data);
                    setMessage(payload.message || 'Created');
                } else {
                    toast.error(payload?.message || 'Create failed');
                }
            }

            setInfoOpen(true);

            // Notify parent to refresh table / update list
            if (onTaskChange && result !== null) {
                // If result hasn't been set yet (async), try to pass the most recent data:
                onTaskChange(res?.data?.addTask?.data ?? res?.data?.editTask?.data, editId);
            } else if (onTaskChange) {
                onTaskChange(res?.data?.addTask?.data ?? res?.data?.editTask?.data, editId);
            }

            // reset local form for next time (only when adding)
            if (!editId) {
                setFormValues({ title: '', description: '' });
                setDueAt(dayjs());
                setStatus('IN_PROGRESS');
            }

            handleLocalClose();
        } catch (err) {
            console.error(err);
            setError(err);
            toast.error(err.message || 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    // options
    const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE'];

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={() => setDialogOpen(true)}>
                Add new Task +
            </Button>

            <Toaster position="top-right" />

            <Dialog open={dialogOpen} onClose={handleLocalClose} fullWidth maxWidth="sm">
                <DialogTitle>{editId ? 'Edit Task' : 'Add Task'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {editId ? 'Edit your task details' : "Let's create a new task for your journey"}
                    </DialogContentText>

                    <Box component="form" id="task-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="title"
                            name="title"
                            label="Title"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formValues.title}
                            onChange={handleInputChange}
                        />

                        <TextField
                            margin="dense"
                            id="description"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formValues.description}
                            onChange={handleInputChange}
                        />

                        <Box sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Due date"
                                    value={dueAt}
                                    onChange={(newVal) => setDueAt(newVal)}
                                    renderInput={(params) => <TextField {...params} margin="dense" fullWidth variant="outlined" />}
                                />
                            </LocalizationProvider>
                        </Box>

                        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                            <InputLabel id="task-status-label">Status</InputLabel>
                            <Select
                                labelId="task-status-label"
                                id="task-status"
                                value={status}
                                label="Status"
                                onChange={handleStatusChange}
                                input={<OutlinedInput label="Status" />}
                            >
                                {statusOptions.map((s) => (
                                    <MenuItem key={s} value={s}>
                                        {s}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                            <InputLabel id="task-status-label">Tag</InputLabel>
                            <Select
                                labelId="task-status-label"
                                id="tag-status"
                                value={tag}
                                label="Status"
                                onChange={handleTagChange}
                                input={<OutlinedInput label="Status" />}
                            >
                                {totalTag.map((s) => (
                                    <MenuItem key={s} value={s.title}>
                                        {s.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleLocalClose}>Cancel</Button>
                    <Button type="submit" form="task-form" disabled={loading}>
                        {loading ? (editId ? 'Saving...' : 'Submitting...') : editId ? 'Save' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {error && (
                <Box sx={{ color: 'error.main', mt: 1 }}>
                    Error: {error.message}
                </Box>
            )}

            {result && (
                <Dialog open={infoOpen} onClose={handleInfoClose} fullWidth maxWidth="sm">
                    <DialogTitle>{message}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <strong>{editId ? 'Task Updated:' : 'Task Created:'}</strong>
                            <div>ID: {result.id}</div>
                            <div>Title: {result.title}</div>
                            <div>Description: {result.description}</div>
                            <div>Due At: {result.dueAt}</div>
                            <div>Task Type: {result.status}</div>
                            <div>Tag: {result.tags.title}</div>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleInfoClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </React.Fragment>
    );
}

TaskForm.propTypes = {
    editId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    open: PropTypes.bool,
    onClose: PropTypes.func,
    rows: PropTypes.array,
    onTaskChange: PropTypes.func,
};
