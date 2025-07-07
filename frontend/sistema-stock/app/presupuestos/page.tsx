"use client"
// import BudgetTable from '@/components/budgetResume'
import '../../styles/globals.css'
import { BudgetGenerator } from '../../components/budget/BudgetGenerator'
import { Suspense } from 'react'
import { Alert } from '@heroui/react'

export default function Page() {
    return (
        <div>
            <div className="mb-4">
                <Alert
                    color="success"
                    title="Ya se encuentran disponibles los sistemas de"
                    description="Bandas Verticales, Roller, Dubai, Paneles, Venecianas."
                    variant="faded"
                />
            </div>
            <Suspense fallback={<div>Cargando...</div>}>
                <BudgetGenerator/>
            </Suspense>
            {/* <BudgetTable/> */}
        </div>
    )
}