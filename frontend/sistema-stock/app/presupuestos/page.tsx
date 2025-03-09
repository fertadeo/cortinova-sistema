"use client"
// import BudgetTable from '@/components/budgetResume'
import '../../styles/globals.css'
import { BudgetGenerator } from '../../components/budget/BudgetGenerator'
import { Suspense } from 'react'

export default function Page() {
    return (
        <div>
            <Suspense fallback={<div>Cargando...</div>}>
                <BudgetGenerator/>
            </Suspense>
            {/* <BudgetTable/> */}
        </div>
    )
}