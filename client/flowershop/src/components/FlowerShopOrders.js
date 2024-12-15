// src/components/FlowerShopOrders.js

import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import axios from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Box,
    Paper,
    TableContainer, // Добавлено
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useTable, useSortBy, usePagination } from 'react-table';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import TypographyComponent from '@mui/material/Typography'; // Убедитесь, что этот импорт есть

function FlowerShopOrders() {
    const { authData } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [editingOrder, setEditingOrder] = useState(null);
    const [completionTime, setCompletionTime] = useState('');

    const allowedStatuses = ['на рассмотрении', 'выполняется', 'выполнен', 'отменён'];

    const [openDialog, setOpenDialog] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchDate, searchStatus, orders]);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get('/api/flowershops/orders', {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setOrders(response.data);
            setFilteredOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Ошибка при получении заказов:', err);
            setError('Не удалось загрузить заказы.');
            setLoading(false);
        }
    }, [authData.token]);

    const filterOrders = useCallback(() => {
        let filtered = [...orders];

        if (searchDate) {
            filtered = filtered.filter((order) =>
                new Date(order.date_of_ordering).toISOString().startsWith(searchDate)
            );
        }

        if (searchStatus) {
            filtered = filtered.filter((order) => order.status === searchStatus);
        }

        setFilteredOrders(filtered);
    }, [searchDate, searchStatus, orders]);

    // Мемоизируем handleStatusChange
    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        try {
            const response = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: response.data.status } : order
                )
            );
            alert('Статус заказа успешно обновлён.');
        } catch (err) {
            console.error('Ошибка при обновлении статуса заказа:', err);
            alert('Не удалось обновить статус заказа.');
        }
    }, [authData.token]);

    // Мемоизируем handleOpenDialog
    const handleOpenDialog = useCallback((orderId) => {
        setOrderToDelete(orderId);
        setOpenDialog(true);
    }, []);

    // Мемоизируем handleCloseDialog
    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        setOrderToDelete(null);
    }, []);

    // Мемоизируем handleDeleteOrder
    const handleDeleteOrder = useCallback(async () => {
        if (!orderToDelete) return;

        try {
            await axios.delete(`/api/orders/${orderToDelete}`, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
            alert('Заказ успешно удалён.');
        } catch (err) {
            console.error('Ошибка при удалении заказа:', err);
            alert('Не удалось удалить заказ.');
        } finally {
            handleCloseDialog();
        }
    }, [orderToDelete, authData.token, handleCloseDialog]);

    // Мемоизируем handleUpdateCompletionTime
    const handleUpdateCompletionTime = useCallback(async (orderId) => {
        if (!completionTime.trim()) {
            alert('Введите корректное время выполнения');
            return;
        }

        try {
            const response = await axios.put(`/api/orders/${orderId}/completion-time`, { completion_time: completionTime }, {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            });
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, completion_time: response.data.order.completion_time } : order
                )
            );
            alert('Время выполнения успешно обновлено');
        } catch (error) {
            console.error('Ошибка при обновлении времени выполнения заказа:', error);
            alert('Не удалось обновить время выполнения заказа.');
        } finally {
            setEditingOrder(null);
        }
    }, [completionTime, authData.token]);

    // Экспорт в Excel
    const exportToExcel = useCallback(() => {
        const data = filteredOrders.map(order => ({
            'ID Заказа': order.id,
            'Время выполнения': order.completion_time || 'Не указано',
            'Имя Клиента': `${order.User.name} ${order.User.surname}`,
            'Телефон Клиента': order.User.phone,
            'Пожелания': order.description,
            'Адрес Доставки': order.delivery_address,
            'Товары': order.OrderItems.map(item => `${item.Product.name} x${item.quantity}`).join(', '),
            'Итоговая Стоимость (₽)': order.total_cost,
            'Статус': order.status,
            'Дата Заказа': new Date(order.date_of_ordering).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказы');
        XLSX.writeFile(workbook, 'orders.xlsx');
    }, [filteredOrders]);

    // Экспорт в PDF с использованием autoTable
    const exportToPDF = useCallback(() => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Список заказов", 14, 22);

        const tableColumn = ["ID Заказа", "Время выполнения", "Имя Клиента", "Телефон Клиента", "Пожелания", "Адрес Доставки", "Товары", "Итоговая Стоимость (₽)", "Статус", "Дата Заказа"];
        const tableRows = [];

        filteredOrders.forEach(order => {
            const orderData = [
                order.id,
                order.completion_time || 'Не указано',
                `${order.User.name} ${order.User.surname}`,
                order.User.phone,
                order.description,
                order.delivery_address,
                order.OrderItems.map(item => `${item.Product.name} x${item.quantity}`).join(', '),
                order.total_cost,
                order.status,
                new Date(order.date_of_ordering).toLocaleString(),
            ];
            tableRows.push(orderData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },
            alternateRowStyles: { fillColor: [240, 248, 255] },
        });

        doc.save('orders.pdf');
    }, [filteredOrders]);

    // Экспорт в Word
    const exportToWord = useCallback(() => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            text: "Список заказов",
                            heading: "Heading1",
                        }),
                        ...filteredOrders.map(order =>
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `ID Заказа: ${order.id} - Статус: ${order.status}`,
                                        bold: true,
                                        size: 24,
                                    }),
                                    new TextRun({
                                        text: `\nВремя выполнения: ${order.completion_time || 'Не указано'}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nИмя Клиента: ${order.User.name} ${order.User.surname}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nТелефон Клиента: ${order.User.phone}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nПожелания: ${order.description}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nАдрес Доставки: ${order.delivery_address}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nТовары: ${order.OrderItems.map(item => `${item.Product.name} x${item.quantity}`).join(', ')}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nИтоговая Стоимость: ${order.total_cost} ₽`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: `\nДата Заказа: ${new Date(order.date_of_ordering).toLocaleString()}`,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: '\n\n',
                                    }),
                                ],
                            })
                        ),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "orders.docx");
        });
    }, [filteredOrders]);

    // Определение столбцов для react-table
    const columns = useMemo(() => [
        {
            Header: 'ID Заказа',
            accessor: 'id',
        },
        {
            Header: 'Время выполнения',
            accessor: 'completion_time',
            Cell: ({ row }) => {
                const orderId = row.original.id;
                const isEditing = editingOrder === orderId;
                return isEditing ? (
                    <TextField
                        value={completionTime}
                        onChange={(e) => setCompletionTime(e.target.value)}
                        onBlur={() => handleUpdateCompletionTime(orderId)}
                        placeholder="Введите время выполнения"
                        fullWidth
                        size="small"
                    />
                ) : (
                    <Typography
                        onClick={() => {
                            setEditingOrder(orderId);
                            setCompletionTime(row.original.completion_time || '');
                        }}
                        sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {row.original.completion_time || 'Не указано'}
                    </Typography>
                );
            }
        },
        {
            Header: 'Имя Клиента',
            accessor: 'User.name',
            Cell: ({ row }) => `${row.original.User.name} ${row.original.User.surname}`,
        },
        {
            Header: 'Телефон Клиента',
            accessor: 'User.phone',
        },
        {
            Header: 'Пожелания',
            accessor: 'description',
        },
        {
            Header: 'Адрес Доставки',
            accessor: 'delivery_address',
        },
        {
            Header: 'Товары',
            accessor: 'OrderItems',
            Cell: ({ row }) => (
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {row.original.OrderItems.map(item => (
                        <li key={item.id}>
                            {item.Product.name} x{item.quantity}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            Header: 'Общая Стоимость (₽)',
            accessor: 'total_cost',
        },
        {
            Header: 'Статус',
            accessor: 'status',
            Cell: ({ row }) => (
                <Select
                    value={row.original.status}
                    onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
                    variant="standard"
                    fullWidth
                >
                    {allowedStatuses.map(status => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            Header: 'Дата Заказа',
            accessor: 'date_of_ordering',
            Cell: ({ value }) => new Date(value).toLocaleString(),
        },
        {
            Header: 'Действия',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDialog(row.original.id)}
                >
                    Удалить
                </Button>
            ),
        },
    ], [editingOrder, completionTime, handleStatusChange, handleUpdateCompletionTime, handleOpenDialog]);

    const data = useMemo(() => filteredOrders, [filteredOrders]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page, // Вместо rows используем page для пагинации
        canPreviousPage,
        canNextPage,
        pageOptions,
        state: { pageIndex, pageSize },
        nextPage,
        previousPage,
        gotoPage,
        setPageSize,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 }, // Начальная страница и размер страницы
        },
        useSortBy,
        usePagination
    );

    return (
        <Container sx={{ padding: '20px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Управление Заказами
            </Typography>

            {/* Фильтры */}
            <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px' }}>
                <TextField
                    label="Поиск по дате (ГГГГ-ММ-ДД)"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    fullWidth
                />
                <Select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="">Все статусы</MenuItem>
                    {allowedStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                        setSearchDate('');
                        setSearchStatus('');
                    }}
                >
                    Сбросить фильтры
                </Button>
            </Box>

            {/* Кнопки экспорта */}
            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <Button onClick={exportToExcel} variant="contained" color="primary" startIcon={<SaveIcon />}>
                    Экспортировать в Excel
                </Button>
                <Button onClick={exportToPDF} variant="contained" color="secondary" startIcon={<DescriptionIcon />}>
                    Экспортировать в PDF
                </Button>
                <Button onClick={exportToWord} variant="contained" color="success" startIcon={<DescriptionIcon />}>
                    Экспортировать в Word
                </Button>
            </Box>

            {/* Таблица заказов */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                    <Typography variant="h6" sx={{ marginRight: '10px' }}>
                        Загрузка заказов...
                    </Typography>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : filteredOrders.length === 0 ? (
                <Alert severity="info">Нет доступных заказов.</Alert>
            ) : (
                <Paper>
                    <TableContainer>
                        <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                style={{
                                                    borderBottom: '1px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#f2f2f2',
                                                    cursor: column.canSort ? 'pointer' : 'default',
                                                }}
                                            >
                                                {column.render('Header')}
                                                {/* Добавление индикаторов сортировки */}
                                                {column.canSort ? (
                                                    <span>
                                                        {column.isSorted
                                                            ? column.isSortedDesc
                                                                ? ' 🔽'
                                                                : ' 🔼'
                                                            : ''}
                                                    </span>
                                                ) : null}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {page.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()} style={{ borderBottom: '1px solid #ddd' }}>
                                            {row.cells.map(cell => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    style={{
                                                        padding: '8px',
                                                        borderBottom: '1px solid #ddd',
                                                    }}
                                                >
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </TableContainer>

                    {/* Пагинация */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" padding="10px">
                        <div>
                            <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                {'<<'}
                            </Button>{' '}
                            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {'<'}
                            </Button>{' '}
                            <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                {'>'}
                            </Button>{' '}
                            <Button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
                                {'>>'}
                            </Button>{' '}
                            <span>
                                Страница{' '}
                                <strong>
                                    {pageIndex + 1} из {pageOptions.length}
                                </strong>{' '}
                            </span>
                        </div>
                        <div>
                            <TextField
                                select
                                label="Строк на странице"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                variant="standard"
                            >
                                {[5, 10, 20, 50].map(pageSize => (
                                    <MenuItem key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </Box>
                </Paper>
            )}

            {/* Диалог подтверждения удаления */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Подтверждение Удаления</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleDeleteOrder} color="error" variant="contained">
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default FlowerShopOrders;
