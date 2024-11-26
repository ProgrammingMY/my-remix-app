import { Index as ConfettiShower } from 'confetti-react'
import { ClientOnly } from 'remix-utils/client-only'
export function Confetti({ id }: { id?: string | null }) {
    if (!id) return null
    return (
        <ClientOnly>
            {() => (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9999
                }}>
                    <ConfettiShower
                        key={id}
                        run={Boolean(id)}
                        recycle={false}
                        numberOfPieces={500}
                        width={window.innerWidth}
                        height={window.innerHeight}
                    />
                </div>
            )}
        </ClientOnly>
    )
}