"use client";

import { PageHeader, ThemeSwitcher, useAuth, useFormatter } from "@/shared";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Flex,
  IconButton,
  Select,
  Switch,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { format } from "date-fns";
import {
  Check,
  ChevronRight,
  Globe,
  Info,
  Mail,
  Palette,
  Phone,
  ShieldCheck,
  Tags,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SettingRowProps {
  icon: any;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const SettingRow = ({
  icon: Icon,
  label,
  description,
  action,
  onClick,
}: SettingRowProps) => (
  <div
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    }}
    className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left group ${
      onClick ? "cursor-pointer" : "cursor-default"
    }`}
  >
    <Flex gap="4" align="center">
      <Flex className="h-10 w-10 rounded-xl items-center justify-center bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors shadow-sm">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </Flex>
      <Flex direction="column" gap="0">
        <Text size="2" weight="bold">
          {label}
        </Text>
        {description && (
          <Text size="1" color="gray">
            {description}
          </Text>
        )}
      </Flex>
    </Flex>
    {action ? (
      action
    ) : (
      <ChevronRight
        className={`h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ${!onClick && "opacity-0"}`}
      />
    )}
  </div>
);

const FONTS = [
  { id: "source-sans", name: "Source Sans 3", preview: "Aa" },
  { id: "inter", name: "Inter", preview: "Aa" },
  { id: "roboto", name: "Roboto", preview: "Aa" },
  { id: "open-sans", name: "Open Sans", preview: "Aa" },
] as const;

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { formatCurrency } = useFormatter();

  const presets = [
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "yyyy-MM-dd",
    "MMMM dd, yyyy",
    "MMM dd, yyyy",
    "EEEE, MMMM dd, yyyy",
  ];

  const currentDateFormat = user?.dateFormat || "MM/dd/yyyy";
  const isCustom = !presets.includes(currentDateFormat);

  const [dateSelection, setDateSelection] = useState(
    isCustom ? "custom" : currentDateFormat,
  );
  const [customFormat, setCustomFormat] = useState(
    isCustom ? currentDateFormat : "",
  );

  useEffect(() => {
    if (user?.dateFormat) {
      const isCustomNow = !presets.includes(user.dateFormat);
      setDateSelection(isCustomNow ? "custom" : user.dateFormat);
      if (isCustomNow) setCustomFormat(user.dateFormat);
    }
  }, [user?.dateFormat]);

  // Form state
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");

  const avatarFallback = user?.name
    ?.split(" ")
    .map((name) => name[0])
    .join("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({ name: editName, phone: editPhone });
      setIsEditModalOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      await updateProfile({ is2faEnabled: enabled });
    } catch (err) {
      // Revert UI if failed (Auth Provider handles toast)
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Profile Card */}
      <Card size="3" className="overflow-hidden">
        <Flex
          justify="between"
          align="center"
          direction={{ initial: "column", sm: "row" }}
          gap="4"
        >
          <Flex gap="4" align="center">
            <Avatar
              size="6"
              radius="full"
              fallback={avatarFallback || "U"}
              className="border-2 border-primary/20"
            />
            <Flex direction="column">
              <Text size="4" weight="bold">
                {user?.name || "User Name"}
              </Text>
              <Text
                size="2"
                color="gray"
                className="flex items-center gap-2 tracking-wide"
              >
                <Mail size={10} /> {user?.email || "user@example.com"}
              </Text>
              {user?.phone && (
                <Text
                  size="1"
                  color="gray"
                  className="flex items-center gap-2 tracking-wider"
                >
                  <Phone size={10} /> {user.phone}
                </Text>
              )}
            </Flex>
          </Flex>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit Profile
          </Button>
        </Flex>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Update your personal information below.
          </Dialog.Description>

          <form onSubmit={handleUpdateProfile}>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Full Name
                </Text>
                <TextField.Root
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Phone Number
                </Text>
                <TextField.Root
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </label>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={isUpdating}>
                Save Changes
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Main Settings Sections */}
      <Flex direction="column" gap="6">
        {/* Account & Security Section */}
        <div className="space-y-3">
          <Text
            size="2"
            weight="bold"
            color="gray"
            className="uppercase tracking-wider"
          >
            Account & Security
          </Text>
          <Card size="1" className="p-0 overflow-hidden">
            <Flex direction="column">
              <SettingRow
                icon={ShieldCheck}
                label="Two-Factor Authentication"
                description="Secure your account with email codes"
                action={
                  <Switch
                    checked={user?.is2faEnabled}
                    onCheckedChange={handleToggle2FA}
                    color="green"
                  />
                }
              />
              <Link href="/forgot-password">
                <SettingRow
                  icon={ShieldCheck}
                  label="Reset Password"
                  description="Change your login credentials"
                />
              </Link>
            </Flex>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <Text
            size="2"
            weight="bold"
            color="gray"
            className="uppercase tracking-wider"
          >
            Preferences
          </Text>
          <Card size="1" className="p-0 overflow-hidden">
            <Flex direction="column">
              <SettingRow
                icon={Palette}
                label="Appearance"
                description="Theme and display preferences"
                action={<ThemeSwitcher isTabStyle={true} />}
              />
              <SettingRow
                icon={Type}
                label="Font Family"
                description="Choose your preferred font"
                action={
                  <Flex gap="2" align="center">
                    <Select.Root
                      value={user?.fontFamily || "Inter"}
                      onValueChange={(val) =>
                        updateProfile({ fontFamily: val })
                      }
                    >
                      <Select.Trigger variant="soft" className="w-36" />
                      <Select.Content position="popper" align="end">
                        {FONTS.map((font) => (
                          <Select.Item
                            key={font.id}
                            value={font.name}
                            style={{
                              fontFamily: `'${font.name}', sans-serif`,
                            }}
                          >
                            {font.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    <Badge
                      variant="soft"
                      color="iris"
                      size="2"
                      style={{
                        fontFamily: `'${user?.fontFamily || "Inter"}', sans-serif`,
                      }}
                    >
                      {user?.fontFamily || "Inter"}
                    </Badge>
                  </Flex>
                }
              />
              <SettingRow
                icon={Globe}
                label="Currency"
                description="Select your preferred currency"
                action={
                  <Flex gap="2" align="center">
                    <Select.Root
                      value={user?.currency || "INR"}
                      onValueChange={(val) => updateProfile({ currency: val })}
                    >
                      <Select.Trigger variant="soft" />
                      <Select.Content position="popper" align="end">
                        <Select.Item value="INR">INR (₹)</Select.Item>
                        <Select.Item value="USD">USD ($)</Select.Item>
                        <Select.Item value="EUR">EUR (€)</Select.Item>
                        <Select.Item value="GBP">GBP (£)</Select.Item>
                      </Select.Content>
                    </Select.Root>
                    <Badge
                      variant="soft"
                      color="iris"
                      size="2"
                      style={{
                        fontFamily: `'${user?.fontFamily || "Inter"}', sans-serif`,
                      }}
                    >
                      {formatCurrency("123456")}
                    </Badge>
                  </Flex>
                }
              />
              <SettingRow
                icon={Globe}
                label="Date Format"
                description="How dates appear across the app"
                action={
                  <Flex gap="2" align="center" className="w-full sm:w-auto">
                    <Select.Root
                      value={dateSelection}
                      onValueChange={(val) => {
                        setDateSelection(val);
                        if (val !== "custom") {
                          updateProfile({ dateFormat: val });
                        }
                      }}
                    >
                      <Select.Trigger variant="soft" />
                      <Select.Content position="popper" align="end">
                        <Select.Group>
                          <Select.Label>Presets</Select.Label>
                          {presets.map((p) => (
                            <Select.Item key={p} value={p}>
                              {p}
                            </Select.Item>
                          ))}
                        </Select.Group>
                        <Select.Separator />
                        <Select.Item value="custom">
                          Custom Format...
                        </Select.Item>
                      </Select.Content>
                    </Select.Root>

                    {dateSelection === "custom" && (
                      <Flex gap="2" align="center">
                        <TextField.Root
                          placeholder="e.g. MMMM do, yyyy"
                          value={customFormat}
                          onChange={(e) => {
                            setCustomFormat(e.target.value);
                          }}
                          color={(() => {
                            if (!customFormat) return undefined;
                            try {
                              format(new Date(), customFormat);
                              return undefined;
                            } catch {
                              return "red";
                            }
                          })()}
                          className="w-48"
                        >
                          <TextField.Slot side="right">
                            <IconButton
                              size="1"
                              variant="ghost"
                              onClick={() => {
                                if (customFormat.trim()) {
                                  updateProfile({
                                    dateFormat: customFormat,
                                  });
                                }
                              }}
                              disabled={(() => {
                                try {
                                  format(new Date(), customFormat);
                                  return false;
                                } catch {
                                  return true;
                                }
                              })()}
                            >
                              <Check size={14} />
                            </IconButton>
                          </TextField.Slot>
                        </TextField.Root>
                        <Tooltip content="Tokens: yyyy, MM, dd, EEE, do...">
                          <Info size={14} />
                        </Tooltip>
                      </Flex>
                    )}

                    <Badge variant="soft" color="iris" size="2">
                      {(() => {
                        const fmt =
                          dateSelection === "custom"
                            ? customFormat
                            : dateSelection;
                        try {
                          return format(new Date(), fmt || "MM/dd/yyyy");
                        } catch {
                          return "Invalid format";
                        }
                      })()}
                    </Badge>
                  </Flex>
                }
              />
              <Link href="/categories">
                <SettingRow
                  icon={Tags}
                  label="Categories"
                  description="Manage your transaction categories"
                />
              </Link>
            </Flex>
          </Card>
        </div>
      </Flex>

      {/* Sign Out Footer */}
      {/* <Section size="1" p="0" mt="4">
        <Card
          size="2"
          className="bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900"
        >
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" color="red">
                Log Out
              </Text>
              <Text size="1" color="gray">
                Sign out of your account on this device
              </Text>
            </Flex>
            <Button
              variant="solid"
              color="red"
              size="3"
              radius="large"
              onClick={() => logout()}
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </Flex>
        </Card>
      </Section> */}

      {/* Footer Info */}
      <Flex direction="column" align="center" gap="1" py="4">
        <Text size="1" color="gray">
          Cashly v1.0.0
        </Text>
        <Text size="1" color="gray">
          Made with ❤️ for better financial management
        </Text>
      </Flex>
    </div>
  );
}
