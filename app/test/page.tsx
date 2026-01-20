"use client";

import "@/styles/table.css";
import "@/styles/dashboard.css";
import Text from "@/components/ui/test/Text";
import { ChangeEvent, useState } from "react";
import Button from "@/components/ui/test/Button";
import Input from "@/components/ui/test/Input";
import Form from "@/components/ui/test/Form";
import FormInput from "@/components/ui/test/FormInput";

export default function page() {
    const [value, setValue] = useState("");
    const [address, setAddress] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };
    return (
        <div className="flex flex-col">
            <div className="w-full overflow-hidden h-[36px]">
                <Button variant="default" size="sm">
                    검색
                </Button>
                <Button variant="primary" size="sm">
                    검색
                </Button>
                <Button variant="secondary" size="sm">
                    검색
                </Button>
                <Button variant="outline" size="sm">
                    검색
                </Button>
                <Input onChange={handleChange} value={value} />
            </div>
            <Form
                title="리드 생성"
                subtitle="새로운 리드를 추가하려면 아래의 항목을 채워주세요."
            >
                <FormInput
                    name="name"
                    label="이름"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAddress(e.target.value)
                    }
                />
                <FormInput
                    name="address"
                    label="주소지"
                    value={address}
                    button={
                        <Button variant="outline" size="sm">
                            검색
                        </Button>
                    }
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAddress(e.target.value)
                    }
                />
                <FormInput
                    name="address-detail"
                    label="상세 주소"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAddress(e.target.value)
                    }
                />
                <FormInput
                    className="text-right"
                    type="number"
                    name="amount"
                    label="금액"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAddress(e.target.value)
                    }
                />
            </Form>
        </div>
    );
}
