import { gql } from '@apollo/client';
import { useState, useEffect } from 'react';
import { client } from '../../../graphql/client';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import TaskForm from './TaskForm';

export default function Task() {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [rows, setRows] = useState([]);
        // const [tags, setTags] = useState([])
        const [editId, setEditId] = useState(null);
        const [formOpen, setFormOpen] = useState(false);
        const paginationModel = { page: 0, pageSize: 5 };

        const GET_TASKS = gql`
                query GetTasks($currentPage: Float!) {
                        tasks(currentPage: $currentPage) {
                                totalTask
                                totalPage
                                items {
                                        id
                                        title
                                        description
                                        dueAt
                                        status
                                        tags {
                                                id
                                                title
                                                description
                                        }
                                }
                        }
                }
        `;
        const DELETE_TASKS = gql`
        mutation DeleteTask($id: Float!) {
  deleteTask(id: $id) { 
    id
    title
    description
    dueAt
    status
  }
}
        `
        const SEARCH_TASKS = gql`
        mutation SearchTask($title: String!) {
  search(title: $title) {
    totalTask
    totalPage
    items {
      id
    title
    description
    dueAt
    status
    }
  }
}
  `;

        useEffect(() => {
                client
                        .query({
                                query: GET_TASKS,
                                variables: { currentPage: Number(paginationModel.page) + 1 }
                        })
                        .then(({ data }) => {
                                setRows(data.tasks.items);
                                setLoading(false);
                        })
                        .catch((err) => {
                                setError(err);
                                setLoading(false);
                        });
        }, []);

        const handleEdit = (id) => {
                setEditId(id);
                setFormOpen(true);
        };

        const handleDelete = async (id) => {
                try {
                        const res = await client.mutate({
                                mutation: DELETE_TASKS,
                                variables: { id: Number(id) }
                        });
                        const deleted = res.data.deleteTask;
                        if (deleted && deleted.id) {
                                setRows(prevRows => prevRows.filter(row => row.id !== deleted.id));
                        }
                } catch (err) {
                        setError(err);
                }
        };
        const handleSearch = async (event) => {
                event.preventDefault();
                setLoading(true);
                setError(null);
                try{
                        const res = await client.mutate({
                                mutation: SEARCH_TASKS,
                                variables: {
                                        title: event.target.search.value
                                },
                        });
                        setRows(res.data.search.items);
                        setLoading(false);
                }catch(err){
                        setError(err);
                }
        }

        const columns = [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'title', headerName: 'Title', width: 300 },
                { field: 'description', headerName: 'Description', width: 500 },
                {
                        field: 'tags',
                        headerName: 'Tags',
                        width: 300,
                        renderCell: (params) => {
                                const tags = params.row.tags || [];
                                return (
                                        <div className="flex flex-wrap gap-1">
                                                {tags.length > 0
                                                        ? tags.map(tag => (
                                                                <span key={tag.id} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium mr-1">
                                                                        {tag.title}
                                                                </span>
                                                        ))
                                                        : <span className="text-gray-400">No tags</span>
                                                }
                                        </div>
                                );
                        },
                },
                {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 180,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                                <div>
                                        <button
                                                style={{ marginRight: 8, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                onClick={() => handleEdit(params.row.id)}
                                        >
                                                Edit
                                        </button>
                                        <button
                                                style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                                onClick={() => handleDelete(params.row.id)}
                                        >
                                                Delete
                                        </button>
                                </div>
                        ),
                },
        ];


        return (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <div className="search">
                                <form className="search mb-4 flex gap-2" onSubmit={handleSearch}>
                                        <input
                                                className='border border-gray-300 rounded-lg px-4 py-2 flex-grow'
                                                type="text"
                                                name='search'
                                                id='search'
                                                placeholder="Search tasks..." />
                                        <button className='btn'>Search</button>
                                </form>
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Tasks</h2>
                        {loading && <p className="text-gray-500">Loading...</p>}
                        {error && <p className="text-red-500">Error : {error.message}</p>}
                        <div className="mb-6">
                                <TaskForm
                                        className="mt-5"
                                        editId={editId}
                                        open={formOpen}
                                        onClose={() => {
                                                setFormOpen(false);
                                                setEditId(null);
                                        }}
                                        rows={rows}
                                />
                        </div>
                        <b className="block text-left text-lg text-indigo-600 mb-2">List of Tasks:</b>
                        <Paper sx={{ height: 400, width: '100%', borderRadius: '1rem', boxShadow: 3 }}>
                                <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        initialState={{ pagination: { paginationModel } }}
                                        pageSizeOptions={[5, 10]}
                                        checkboxSelection
                                        sx={{ border: 0, fontSize: 16, backgroundColor: 'white', borderRadius: '1rem' }}
                                />
                        </Paper>
                </div>
        );
}