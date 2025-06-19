import React, {
    useCallback,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef
} from 'react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from './utils/CropImage';

interface ImageCropperProps {
    file: File;
    onCropComplete: (file: File) => void;
}

const ImageCropper = forwardRef(({ file, onCropComplete }: ImageCropperProps, ref) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [file]);

    const onCropDone = useCallback(async () => {
        if (!imageUrl || !croppedAreaPixels) return;
        const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
        const croppedFile = new File([croppedBlob], file.name, { type: file.type });
        onCropComplete(croppedFile);
    }, [imageUrl, croppedAreaPixels, file, onCropComplete]);

    useImperativeHandle(ref, () => ({
        crop: onCropDone
    }));

    return (
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#333' }}>
            <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
        </div>
    );
});

export default ImageCropper;
