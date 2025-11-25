import { QrCode } from "lucide-react";

interface IDCardBackProps {
    userData: {
        issueDate: string;
        expiryDate: string;
        address: string;
        bloodType: string;
        height: string;
        issuer: string;
    };
}

const IDCardBack = ({ userData }: IDCardBackProps) => {
    return (
        <div
            className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-bl from-green-800 to-primary p-6 flex flex-col border border-white/20"
            style={{ transform: "rotateY(180deg)" }}
        >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "10px 10px" }}></div>

            <div className="flex-1 space-y-5 relative z-10 text-white">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Date d'émission</p>
                        <p className="font-medium text-sm">{userData.issueDate}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Date d'expiration</p>
                        <p className="font-medium text-sm">{userData.expiryDate}</p>
                    </div>
                </div>

                <div>
                    <p className="text-[9px] uppercase text-white/60 tracking-wider">Adresse</p>
                    <p className="font-medium text-sm whitespace-pre-line">{userData.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Groupe Sanguin</p>
                        <p className="font-medium text-sm">{userData.bloodType}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase text-white/60 tracking-wider">Taille</p>
                        <p className="font-medium text-sm">{userData.height}</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto flex items-center justify-between relative z-10">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                    <QrCode className="text-black w-14 h-14" />
                </div>
                <div className="text-right">
                    <p className="text-[9px] uppercase text-white/60 tracking-wider">Autorité d'émission</p>
                    <p className="font-bold text-sm text-white">{userData.issuer}</p>
                    {/* Barcode Placeholder */}
                    <div className="mt-2 w-32 h-8 bg-white/20 rounded ml-auto flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Code_39_barcode.svg/1200px-Code_39_barcode.svg.png')] bg-cover opacity-80 mix-blend-screen"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDCardBack;
