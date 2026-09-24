import React from 'react'

function QuestionListContainer({ questionList }) {
    return (
        <div>
            <h2 className='font-bold text-lg mb-5'>Generisana pitanja ({questionList.length})</h2>
            <div className='p-5 border rounded-xl bg-white space-y-3'>
                {questionList.map((item, index) => (
                    <div key={index} className='p-3 border border-gray-200 rounded-xl flex gap-3'>
                        <span className='h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center'>
                            {index + 1}
                        </span>
                        <div>
                            <h2 className='font-medium'>{item.question}</h2>
                            {item?.type && (
                                <span className='mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
                                    {item.type}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default QuestionListContainer
