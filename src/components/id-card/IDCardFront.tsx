import { ShieldCheck } from "lucide-react";

interface IDCardFrontProps {
    userData: {
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: string;
        nip: string;
        photoUrl: string;
    };
}

const IDCardFront = ({ userData }: IDCardFrontProps) => {
    return (
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-green-700 p-6 flex flex-col justify-between border border-white/20">
            {/* Holographic Effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-inner">
                        <span className="font-bold text-sm text-white">GA</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">République Gabonaise</p>
                        <p className="text-xs font-bold text-white tracking-wide">CARTE NATIONALE D'IDENTITÉ</p>
                    </div>
                </div>
                <div className="bg-white/20 p-1 rounded backdrop-blur-sm">
                    {/* Placeholder for Flag */}
                    <div className="w-8 h-5 bg-gradient-to-b from-green-500 via-yellow-400 to-blue-600 rounded shadow-sm opacity-90"></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex items-end space-x-5 z-10 mt-4">
                <div className="w-24 h-32 bg-gray-200 rounded-xl overflow-hidden border-2 border-white/40 shadow-lg relative">
                    <img src={userData.photoUrl} alt="ID" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="flex-1 space-y-3 pb-1">
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Nom</p>
                        <p className="font-bold text-xl leading-none text-white drop-shadow-sm">{userData.lastName}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Prénoms</p>
                        <p className="font-bold text-lg leading-none text-white drop-shadow-sm">{userData.firstName}</p>
                    </div>
                    <div className="flex space-x-6">
                        <div>
                            <p className="text-[9px] uppercase text-white/60 tracking-wider">Né le</p>
                            <p className="font-medium text-sm text-white">{userData.birthDate}</p>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase text-white/60 tracking-wider">Sexe</p>
                            <p className="font-medium text-sm text-white">{userData.gender}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="z-10 pt-4 border-t border-white/10 mt-auto flex justify-between items-end">
                <div>
                    <p className="text-[9px] uppercase text-white/60 tracking-wider mb-1">NIP (Numéro d'Identification Personnel)</p>
                    <p className="font-mono text-lg tracking-[0.15em] text-yellow-300 font-bold drop-shadow-md">{userData.nip}</p>
                </div>
                <ShieldCheck className="text-white/50 w-6 h-6" />
            </div>
        </div>
    );
};

export default IDCardFront;
