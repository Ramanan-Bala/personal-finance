"use client";

import { PageHeader, ResponsiveModal, ThemeSwitcher, useAuth } from "@/shared";
import {
  Avatar,
  Badge,
  Button,
  Card,
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
  LucideIcon,
  Mail,
  Palette,
  Phone,
  ShieldCheck,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import RecurringTransactionsSection from "./components/recurring-transactions-section";

interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const DATE_FORMAT_PRESETS = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "MMMM dd, yyyy",
  "MMM dd, yyyy",
  "EEEE, MMMM dd, yyyy",
];

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
    className={`w-full flex justify-between items-center flex-wrap sm:flex-row sm:items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left group ${
      onClick ? "cursor-pointer" : "cursor-default"
    }`}
  >
    <Flex gap="4" align="center" className="min-w-0 shrink-0">
      <Flex className="h-10 w-10 shrink-0 rounded-xl items-center justify-center bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors shadow-sm">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </Flex>
      <Flex direction="column" gap="0" className="min-w-0">
        <Text size="2" weight="bold" truncate>
          {label}
        </Text>
        {description && (
          <Text size="1" color="gray" truncate>
            {description}
          </Text>
        )}
      </Flex>
    </Flex>
    <div className="sm:ml-auto shrink-0">
      {action ? (
        action
      ) : (
        <ChevronRight
          className={`h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform ${!onClick && "opacity-0"}`}
        />
      )}
    </div>
  </div>
);

const FONTS = [
  { id: "source-sans", name: "Source Sans 3", preview: "Aa" },
  { id: "inter", name: "Inter", preview: "Aa" },
  { id: "roboto", name: "Roboto", preview: "Aa" },
  { id: "open-sans", name: "Open Sans", preview: "Aa" },
] as const;

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentDateFormat = user?.dateFormat || "MM/dd/yyyy";
  const isCustom = !DATE_FORMAT_PRESETS.includes(currentDateFormat);

  const [dateSelection, setDateSelection] = useState(
    isCustom ? "custom" : currentDateFormat,
  );
  const [customFormat, setCustomFormat] = useState(
    isCustom ? currentDateFormat : "",
  );

  useEffect(() => {
    if (user?.dateFormat) {
      const isCustomNow = !DATE_FORMAT_PRESETS.includes(user.dateFormat);
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
    } catch {
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
      <ResponsiveModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Profile"
        description="Update your personal information below."
      >
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
            <Button
              variant="soft"
              color="gray"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isUpdating}>
              Save Changes
            </Button>
          </Flex>
        </form>
      </ResponsiveModal>

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
                action={<ThemeSwitcher isTabStyle={false} />}
              />
              <SettingRow
                icon={Type}
                label="Font Family"
                description="Choose your preferred font"
                action={
                  <Flex gap="2" align="center" wrap="wrap">
                    <Select.Root
                      value={user?.fontFamily || "Inter"}
                      onValueChange={(val) =>
                        updateProfile({ fontFamily: val })
                      }
                    >
                      <Select.Trigger variant="soft" />
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
                  </Flex>
                }
              />
              <SettingRow
                icon={Globe}
                label="Currency"
                description="Select your preferred currency"
                action={
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
                }
              />
              <SettingRow
                icon={Globe}
                label="Date Format"
                description="How dates appear across the app"
                action={
                  <Flex gap="2" align="center" wrap="wrap">
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
                          {DATE_FORMAT_PRESETS.map((p) => (
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
                          onChange={(e) => setCustomFormat(e.target.value)}
                          color={(() => {
                            if (!customFormat) return undefined;
                            try {
                              format(new Date(), customFormat);
                              return undefined;
                            } catch {
                              return "red";
                            }
                          })()}
                          className="w-40"
                        >
                          <TextField.Slot side="right">
                            <IconButton
                              size="1"
                              variant="ghost"
                              onClick={() => {
                                if (customFormat.trim()) {
                                  updateProfile({ dateFormat: customFormat });
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
            </Flex>
          </Card>
        </div>
        {/* Recurring Transactions Section */}
        <RecurringTransactionsSection />
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
    </div>
  );
}
