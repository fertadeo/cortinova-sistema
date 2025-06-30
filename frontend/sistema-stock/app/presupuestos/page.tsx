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
                    color="primary"
                    description="Este módulo se encuentra en desarrollo, ¡ya falta poco!"
                    title="¡Estamos en eso!"
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