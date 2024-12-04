import { Search } from 'lucide-react';
import { useState } from 'react'
import { Input } from './ui/input';
import { Form, useNavigate } from '@remix-run/react';

export const SearchInput = () => {
    const [value, setValue] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (value) {
            navigate(`/search?title=${value}`);
        } else {
            navigate('/search');
        }
    };

    return (
        <Form method="get" className='relative w-full' onSubmit={handleSubmit}>
            <Search className='h-4 w-4 absolute top-3 left-3 text-slate-600' />
            <Input
                onChange={(e) => setValue(e.target.value)}
                value={value}
                className='w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200'
                placeholder='Search for a course'
            />
        </Form>
    )
}
